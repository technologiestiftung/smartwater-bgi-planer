import { createLayerByType } from "@/components/Map/LayerInitializer/shared/layerFactory";
import {
	createManagedLayer,
	createManagedLayerFromConfig,
	createVectorLayer,
	DEFAULT_STYLE,
	ensureVectorLayer,
	exportLayerAsGeoJSON,
	generatePreviewUrl,
	getBaseUrl,
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
			const previewUrl = wmsLayer.get("previewUrl");

			const serviceConfig: LayerService = {
				id: layerId,
				name: wmsLayer.get("title") || "WMS Layer",
				typ: "WMS",
				url: source.getUrls()?.[0],
				layers: wmsParams.LAYERS,
				format: wmsParams.FORMAT || "image/png",
				version: wmsParams.VERSION || "1.3.0",
				transparent: wmsParams.TRANSPARENT !== false,
				singleTile: false,
				crs: wmsParams.CRS || wmsParams.SRS,
				...(previewUrl && { preview: { src: previewUrl } }),
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

	// Save a single layer
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

	// Debounced save
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

	// Setup WMS layer properties
	const setupWmsLayerProperties = useCallback(
		(params: {
			olLayer: any;
			layerId: string;
			serviceConfig: LayerService;
			displayFileName?: string;
		}) => {
			const { olLayer, layerId, serviceConfig } = params;

			const baseUrl = getBaseUrl(serviceConfig.url || "");
			const previewUrl =
				serviceConfig.preview?.src ||
				generatePreviewUrl(
					baseUrl,
					serviceConfig.layers || "",
					serviceConfig.version || "1.3.0",
				);

			olLayer.set("id", layerId);
			olLayer.set("name", serviceConfig.name);
			if (previewUrl) {
				olLayer.set("previewUrl", previewUrl);
			}
		},
		[],
	);

	// Restore WMS layer from config
	const restoreWmsLayer = useCallback(
		async (params: {
			mapInstance: Map;
			layerId: string;
			serviceConfig: LayerService;
			displayFileName?: string;
		}) => {
			const { mapInstance, layerId, serviceConfig, displayFileName } = params;

			const {
				layer: olLayer,
				status,
				error,
			} = createLayerByType(serviceConfig, {
				wmtsCapabilities: {},
				config: null,
			});

			if (!olLayer || status !== "loaded") {
				throw new Error(`Failed to create WMS layer: ${error}`);
			}

			setupWmsLayerProperties({
				olLayer,
				layerId,
				serviceConfig,
				displayFileName,
			});
			olLayer.setZIndex(500);
			mapInstance.addLayer(olLayer);

			const managedLayer = createManagedLayerFromConfig({
				layerId,
				name: displayFileName || serviceConfig.name,
				olLayer,
				zIndex: 500,
				layerType: "subject",
				service: serviceConfig,
			});
			addLayer(managedLayer);
		},
		[addLayer, setupWmsLayerProperties],
	);

	// Restore vector layer from GeoJSON
	const restoreVectorLayer = useCallback(
		async (params: {
			mapInstance: Map;
			layerId: string;
			geojsonText: string;
			displayFileName?: string;
		}) => {
			const { mapInstance, layerId, geojsonText, displayFileName } = params;

			const geojsonObject = JSON.parse(geojsonText);
			const format = new GeoJSON();
			const features = format.readFeatures(geojsonObject, {
				dataProjection: "EPSG:4326",
				featureProjection: mapInstance.getView().getProjection().getCode(),
			});

			const displayName =
				displayFileName || layerId.replace(/\.(geojson|json)$/i, "");
			const vectorLayer = createVectorLayer({
				features,
				fileName: displayName,
				layerId,
				style: DEFAULT_STYLE,
			});

			vectorLayer.setZIndex(501);
			mapInstance.addLayer(vectorLayer);
			addLayer(createManagedLayer(layerId, displayName, vectorLayer));
		},
		[addLayer],
	);

	// Restore uploaded layer (WMS or Vector)
	const restoreUploadedLayer = useCallback(
		async (
			mapInstance: Map,
			layerId: string,
			layerFile: { file: File; displayFileName?: string },
		): Promise<void> => {
			if (getLayerById(mapInstance, layerId)) {
				console.log(`Layer ${layerId} already exists, skipping restore`);
				return;
			}

			try {
				const fileContent = await layerFile.file.text();

				if (layerId.includes("uploaded_wms_")) {
					const serviceConfig: LayerService = JSON.parse(fileContent);
					await restoreWmsLayer({
						mapInstance,
						layerId,
						serviceConfig,
						displayFileName: layerFile.displayFileName,
					});
				} else {
					await restoreVectorLayer({
						mapInstance,
						layerId,
						geojsonText: fileContent,
						displayFileName: layerFile.displayFileName,
					});
				}
			} catch (error) {
				console.error(
					`[restoreUploadedLayer] Error restoring layer ${layerId}:`,
					error,
				);
				throw error;
			}
		},
		[restoreWmsLayer, restoreVectorLayer],
	);

	// Generic restore layers function
	const restoreLayers = useCallback(
		async (layerIds: string[], type: "draw" | "uploaded") => {
			if (!map || !mapReady || !autoRestore) return;

			const project = getProject();
			if (!project) return;

			await Promise.all(
				layerIds.map(async (layerId) => {
					try {
						const layerFile = getFile(project.id, layerId);
						if (!layerFile) return;

						if (type === "uploaded") {
							await restoreUploadedLayer(map, layerId, {
								file: layerFile.file,
								displayFileName: layerFile.displayFileName,
							});
						} else {
							ensureVectorLayer(map, layerId);
							await importLayerFromGeoJSON(map, layerId, layerFile.file);
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

	// Save multiple layers
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

	// Specific restore/save functions
	const restoreDrawLayers = useCallback(async () => {
		const drawLayerIds = getLayerIdsFromFolder("Draw Layers");
		await restoreLayers(drawLayerIds, "draw");
	}, [restoreLayers]);

	const restoreUploadedLayers = useCallback(async () => {
		const project = getProject();
		if (!project) return;

		const uploadedLayerIds = getAllProjectFiles(project.id)
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

	// Setup auto-save listeners for draw layers
	const setupAutoSave = useCallback(() => {
		if (!map || !mapReady || !autoSave) return;

		// Cleanup existing listeners
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

	// One-time restore on mount
	useEffect(() => {
		if (!map || !mapReady || !autoRestore || hasRestoredRef.current) return;

		const project = getProject();
		if (!project) return;

		(async () => {
			await restoreDrawLayers();
			await restoreUploadedLayers();
			hasRestoredRef.current = true;
			setupAutoSave();
		})();
	}, [
		map,
		mapReady,
		autoRestore,
		getProject,
		restoreDrawLayers,
		restoreUploadedLayers,
		setupAutoSave,
	]);

	// Cleanup timers and listeners
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
