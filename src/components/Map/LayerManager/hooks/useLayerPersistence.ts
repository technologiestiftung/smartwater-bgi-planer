import {
	createManagedLayer,
	createVectorLayer,
	DEFAULT_STYLE,
	exportLayerAsGeoJSON,
	getLayerById,
	getLayerIdsFromFolder,
	importLayerFromGeoJSON,
	layerHasFeatures,
} from "@/lib/helpers/ol";
import { useLayersStore } from "@/store";
import { useFilesStore } from "@/store/files";
import { useMapStore } from "@/store/map";
import { useProjectsStore } from "@/store/projects";
import { Map } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
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

	const saveLayer = useCallback(
		async (layerId: string) => {
			if (!map) return;

			const project = getProject();
			if (!project) return;

			if (layerId.includes("wms") || layerId.includes("wmts")) {
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
		[map, getProject, addFile, getFile, deleteFile],
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
			try {
				const geojsonText = await layerFile.file.text();
				const geojsonObject = JSON.parse(geojsonText);

				const format = new GeoJSON();
				const features = format.readFeatures(geojsonObject, {
					dataProjection: "EPSG:4326",
					featureProjection: mapInstance.getView().getProjection().getCode(),
				});

				// Use the stored original filename as display name
				const displayName =
					layerFile.displayFileName ||
					layerFile.file.name.replace(/\.(geojson|json)$/i, "");

				console.log("[use-layer-persistence] displayName::", displayName);

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
					.filter((layerId) => layerHasFeatures(map, layerId))
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
			.filter(
				(file) =>
					file.layerId.startsWith("uploaded_") && !file.layerId.includes("wms"),
			)
			.map((file) => file.layerId);

		await restoreLayers(uploadedLayerIds, "uploaded");
	}, [getProject, getAllProjectFiles, restoreLayers]);

	const saveAllDrawLayers = useCallback(async () => {
		const drawLayerIds = getLayerIdsFromFolder("Draw Layers");
		await saveAllLayers(drawLayerIds);
	}, [saveAllLayers]);

	const saveAllUploadedLayers = useCallback(async () => {
		const uploadedLayerIds = Array.from(layers.values())
			.filter(
				(layer) =>
					layer.id.startsWith("uploaded_") && !layer.id.includes("wms"),
			)
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

		hasRestoredRef.current = true;

		(async () => {
			await restoreDrawLayers();
			await restoreUploadedLayers();
		})();
	}, [
		map,
		mapReady,
		autoRestore,
		getProject,
		restoreDrawLayers,
		restoreUploadedLayers,
	]);

	// Auto-save uploaded layers when they change
	// we might don't need this, since uploaded layers should not change
	useEffect(() => {
		const uploadedLayersList = Array.from(layers.values()).filter(
			(layer) => layer.id.startsWith("uploaded_") && !layer.id.includes("wms"),
		);

		if (!uploadedLayersList.length || !autoSave) return;

		uploadedLayersList.forEach((layer) => {
			saveLayer(layer.id);
		});
	}, [layers, autoSave, saveLayer]);

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
