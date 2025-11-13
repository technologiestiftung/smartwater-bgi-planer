import { createLayerByType } from "@/components/Map/LayerInitializer/shared/layerFactory";
import {
	createManagedLayer,
	createVectorLayer,
	DEFAULT_STYLE,
	ensureVectorLayer,
	exportLayerAsGeoJSON,
	getLayerById,
	getLayerIdsFromFolder,
	importLayerFromGeoJSON,
} from "@/lib/helpers/ol";
import { useLayersStore } from "@/store";
import { useFilesStore } from "@/store/files";
import { LayerService } from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { useProjectsStore } from "@/store/projects";
import { Map } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import { useCallback, useEffect, useRef } from "react";

interface UseLayerPersistenceOptions {
	debounceDelay?: number;
	autoSave?: boolean;
	autoRestore?: boolean;
}

export const useLayerPersistence = (
	options: UseLayerPersistenceOptions = {},
) => {
	const { debounceDelay = 1000, autoSave = true, autoRestore = true } = options;
	const map = useMapStore((state) => state.map);
	const mapReady = useMapStore((state) => state.isReady);
	const getProject = useProjectsStore((state) => state.getProject);
	const { addFile, getFile, deleteFile, getAllProjectFiles } = useFilesStore();
	const { layers, addLayer } = useLayersStore();

	const debounceTimersRef = useRef<
		Record<string, ReturnType<typeof setTimeout>>
	>({});
	const layerListenersRef = useRef<Record<string, () => void>>({});
	const hasRestoredRef = useRef(false);

	const saveWmsLayer = useCallback(
		async (layerId: string, project: any) => {
			if (!map) return;

			const wmsLayer = getLayerById(map, layerId);
			if (!wmsLayer) return;

			const source = wmsLayer.getSource();
			if (!(source instanceof TileWMS)) return;

			const wmsParams = source.getParams();
			const sourceUrl = source.getUrls()?.[0];

			// Create a complete LayerService configuration for WMS
			const serviceConfig: LayerService = {
				id: layerId,
				name: wmsLayer.get("title") || "WMS Layer",
				typ: "WMS",
				url: sourceUrl,
				layers: wmsParams.LAYERS,
				format: wmsParams.FORMAT || "image/png",
				version: wmsParams.VERSION || "1.3.0",
				transparent: wmsParams.TRANSPARENT !== false,
				singleTile: false,
				crs: wmsParams.CRS || wmsParams.SRS,
			};

			await addFile({
				projectId: project.id,
				layerId,
				file: new File(
					[JSON.stringify(serviceConfig, null, 2)],
					`${layerId}.json`,
					{ type: "application/json" },
				),
				displayFileName: wmsLayer.get("title"),
			});
		},
		[map, addFile],
	);

	const saveLayer = useCallback(
		async (layerId: string) => {
			if (!map) return;

			const project = getProject();
			if (!project) return;

			if (layerId.includes("uploaded_wms_")) {
				await saveWmsLayer(layerId, project);
				return;
			}

			try {
				const geoJsonFile = exportLayerAsGeoJSON(map, layerId);

				if (geoJsonFile) {
					await addFile({
						projectId: project.id,
						layerId,
						file: geoJsonFile,
					});
				} else if (getFile(project.id, layerId)) {
					await deleteFile(project.id, layerId);
				}
			} catch (error) {
				console.error(
					`[useLayerPersistence] Error saving layer ${layerId}:`,
					error,
				);
			}
		},
		[map, getProject, saveWmsLayer, addFile, getFile, deleteFile],
	);

	const saveLayerDebounced = useCallback(
		(layerId: string) => {
			if (!autoSave) return;

			clearTimeout(debounceTimersRef.current[layerId]);

			debounceTimersRef.current[layerId] = setTimeout(() => {
				saveLayer(layerId);
				delete debounceTimersRef.current[layerId];
			}, debounceDelay);
		},
		[autoSave, debounceDelay, saveLayer],
	);

	const restoreUploadedLayer = useCallback(
		async (
			mapInstance: Map,
			layerId: string,
			layerFile: { file: File; displayFileName?: string },
		): Promise<void> => {
			// Check if layer already exists
			if (getLayerById(mapInstance, layerId)) {
				console.log(`Layer ${layerId} already exists, skipping restore`);
				return;
			}

			if (layerId.includes("uploaded_wms_")) {
				try {
					const serviceConfigText = await layerFile.file.text();
					const serviceConfig: LayerService = JSON.parse(serviceConfigText);

					const {
						layer: olLayer,
						status,
						error,
					} = createLayerByType(serviceConfig, {
						wmtsCapabilities: {},
						config: null,
					});

					if (olLayer && status === "loaded") {
						olLayer.set("id", layerId);
						olLayer.set(
							"title",
							layerFile.displayFileName || serviceConfig.name,
						);

						mapInstance.addLayer(olLayer);

						// Create managed layer for the layer store
						const managedLayer = {
							id: layerId,
							config: {
								id: layerId,
								name: layerFile.displayFileName || serviceConfig.name,
								visibility: true,
								status: "loaded" as const,
								elements: [],
								service: serviceConfig,
							},
							olLayer,
							status: "loaded" as const,
							visibility: true,
							opacity: 1,
							zIndex: 999,
							layerType: "subject" as const,
						};

						addLayer(managedLayer);

						console.log(
							"[useLayerPersistence] Successfully restored WMS layer:",
							managedLayer,
						);
					} else {
						throw new Error(`Failed to create WMS layer: ${error}`);
					}
				} catch (error) {
					console.error(
						`[restoreUploadedLayer] Error restoring WMS layer ${layerId}:`,
						error,
					);
					throw error;
				}
				return;
			}

			try {
				const geojsonText = await layerFile.file.text();
				const geojsonObject = JSON.parse(geojsonText);

				const format = new GeoJSON();
				const features = format.readFeatures(geojsonObject, {
					dataProjection: "EPSG:4326",
					featureProjection: mapInstance.getView().getProjection().getCode(),
				});

				const displayName =
					layerFile.displayFileName ||
					layerFile.file.name.replace(/\.(geojson|json)$/i, "");

				const vectorLayer = createVectorLayer(
					features,
					displayName,
					layerId,
					DEFAULT_STYLE,
				);

				mapInstance.addLayer(vectorLayer);
				addLayer(createManagedLayer(layerId, displayName, vectorLayer));
			} catch (error) {
				console.error(
					`[restoreUploadedLayer] Error restoring layer ${layerId}:`,
					error,
				);
				throw error;
			}
		},
		[addLayer],
	);

	const restoreLayers = useCallback(
		async (layerIds: string[], type: "draw" | "uploaded") => {
			if (!map || !mapReady || !autoRestore) return;

			const project = getProject();
			if (!project) return;

			await Promise.all(
				layerIds.map(async (layerId) => {
					try {
						const layerFile = getFile(project.id, layerId);
						if (layerFile) {
							if (type === "uploaded") {
								await restoreUploadedLayer(map, layerId, {
									file: layerFile.file,
									displayFileName: layerFile.displayFileName,
								});
							} else {
								// For draw layers, ensure the layer exists before importing
								ensureVectorLayer(map, layerId);
								await importLayerFromGeoJSON(map, layerId, layerFile.file);
							}
						}
					} catch (error) {
						console.error(
							`[useLayerPersistence] Error restoring layer ${layerId}:`,
							error,
						);
					}
				}),
			);
		},
		[map, mapReady, autoRestore, getProject, getFile, restoreUploadedLayer],
	);

	const saveAllLayers = useCallback(
		async (layerIds: string[]) => {
			if (!map) return;

			await Promise.all(
				layerIds
					.filter((layerId) => getLayerById(map, layerId))
					.map((layerId) => saveLayer(layerId)),
			);
		},
		[map, saveLayer],
	);

	const restoreDrawLayers = useCallback(async () => {
		const drawLayerIds = getLayerIdsFromFolder("Draw Layers");
		await restoreLayers(drawLayerIds, "draw");
	}, [restoreLayers]);

	const restoreUploadedLayers = useCallback(async () => {
		const project = getProject();
		if (!project) return;

		const allProjectFiles = getAllProjectFiles(project.id);
		const uploadedLayerIds = allProjectFiles
			.filter((file) => file.layerId.startsWith("uploaded_"))
			.map((file) => file.layerId);

		await restoreLayers(uploadedLayerIds, "uploaded");
	}, [getProject, getAllProjectFiles, restoreLayers]);

	const saveAllDrawLayers = useCallback(async () => {
		const drawLayerIds = getLayerIdsFromFolder("Draw Layers");
		await saveAllLayers(drawLayerIds);
	}, [saveAllLayers]);

	const saveAllUploadedLayers = useCallback(async () => {
		const uploadedLayerIds = Array.from(layers.values())
			.filter((layer) => layer.id.startsWith("uploaded_"))
			.map((layer) => layer.id);
		await saveAllLayers(uploadedLayerIds);
	}, [layers, saveAllLayers]);

	const setupAutoSave = useCallback(() => {
		if (!map || !mapReady || !autoSave) return;

		Object.values(layerListenersRef.current).forEach((cleanup) => cleanup());
		layerListenersRef.current = {};

		const drawLayerIds = getLayerIdsFromFolder("Draw Layers");
		drawLayerIds.forEach((layerId) => {
			const layer = getLayerById(
				map,
				layerId,
			) as VectorLayer<VectorSource> | null;
			const source = layer?.getSource();
			if (!source) return;

			const handleFeatureChange = () => saveLayerDebounced(layerId);

			source.on("addfeature", handleFeatureChange);
			source.on("removefeature", handleFeatureChange);
			source.on("changefeature", handleFeatureChange);

			layerListenersRef.current[layerId] = () => {
				source.un("addfeature", handleFeatureChange);
				source.un("removefeature", handleFeatureChange);
				source.un("changefeature", handleFeatureChange);
			};
		});
	}, [map, mapReady, autoSave, saveLayerDebounced]);

	// Auto-save setup
	useEffect(() => {
		setupAutoSave();
	}, [setupAutoSave]);

	// One-time restore on mount
	useEffect(() => {
		if (!map || !mapReady || !autoRestore) return;

		const project = getProject();
		if (!project || hasRestoredRef.current) return;

		(async () => {
			await restoreDrawLayers();
			await restoreUploadedLayers();
			hasRestoredRef.current = true;
		})();
	}, [
		map,
		mapReady,
		autoRestore,
		getProject,
		restoreDrawLayers,
		restoreUploadedLayers,
	]);

	// Cleanup
	useEffect(() => {
		const currentTimers = debounceTimersRef.current;
		const currentListeners = layerListenersRef.current;

		return () => {
			Object.values(currentTimers).forEach((timer) => clearTimeout(timer));
			Object.values(currentListeners).forEach((cleanup) => cleanup());
		};
	}, []);

	return {
		saveLayer,
		saveAllDrawLayers,
		restoreDrawLayers,
		setupAutoSave,
		saveAllUploadedLayers,
		restoreUploadedLayers,
	};
};
