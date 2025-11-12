import {
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
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { useCallback, useEffect, useMemo, useRef } from "react";

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
	const { addFile, getFile, deleteFile } = useFilesStore();
	const { layers } = useLayersStore();

	const uploadedLayers = useMemo(() => {
		return Array.from(layers.values()).filter((layer) =>
			layer.id.startsWith("uploaded_"),
		);
	}, [layers]);

	const getUploadedLayerIds = useCallback(() => {
		return uploadedLayers.map((layer) => layer.id);
	}, [uploadedLayers]);

	const getDrawLayerIds = useCallback(() => {
		return getLayerIdsFromFolder("Draw Layers");
	}, []);

	const debounceTimersRef = useRef<
		Record<string, ReturnType<typeof setTimeout>>
	>({});
	const layerListenersRef = useRef<Record<string, () => void>>({});

	const saveLayer = useCallback(
		async (layerId: string) => {
			if (!map) return;

			const project = getProject();
			if (!project) return;

			try {
				const geoJsonFile = exportLayerAsGeoJSON(map, layerId);

				if (geoJsonFile) {
					await addFile(project.id, layerId, geoJsonFile);
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

	useEffect(() => {
		if (!uploadedLayers.length) return;

		uploadedLayers.forEach((layer) => {
			if (autoSave) {
				saveLayer(layer.id);
			}
		});
	}, [uploadedLayers, autoSave, saveLayer]);

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

	const restoreLayers = useCallback(
		async (layerIds: string[]) => {
			if (!map || !mapReady || !autoRestore) return;

			const project = getProject();
			if (!project) return;

			await Promise.all(
				layerIds.map(async (layerId) => {
					try {
						const layerFile = getFile(project.id, layerId);
						if (layerFile) {
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
		[map, mapReady, autoRestore, getProject, getFile],
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

	const createLayerActions = useCallback(
		(getLayerIds: () => string[]) => ({
			restore: () => restoreLayers(getLayerIds()),
			saveAll: () => saveAllLayers(getLayerIds()),
		}),
		[restoreLayers, saveAllLayers],
	);

	const uploadedActions = useMemo(
		() => createLayerActions(getUploadedLayerIds),
		[createLayerActions, getUploadedLayerIds],
	);

	const drawActions = useMemo(
		() => createLayerActions(getDrawLayerIds),
		[createLayerActions, getDrawLayerIds],
	);

	const setupAutoSave = useCallback(() => {
		if (!map || !mapReady || !autoSave) return;

		Object.values(layerListenersRef.current).forEach((cleanup) => cleanup());
		layerListenersRef.current = {};

		getDrawLayerIds().forEach((layerId) => {
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
	}, [map, mapReady, autoSave, saveLayerDebounced, getDrawLayerIds]);

	useEffect(() => {
		setupAutoSave();
	}, [setupAutoSave]);

	useEffect(() => {
		const project = getProject();
		if (project) {
			drawActions.restore();
			uploadedActions.restore();
		}
	}, [getProject, drawActions, uploadedActions]);

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
		saveAllDrawLayers: drawActions.saveAll,
		restoreDrawLayers: drawActions.restore,
		setupAutoSave,
		saveAllUploadedLayers: uploadedActions.saveAll,
		restoreUploadedLayers: uploadedActions.restore,
	};
};
