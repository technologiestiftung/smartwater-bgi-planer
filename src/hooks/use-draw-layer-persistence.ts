import {
	exportLayerAsGeoJSON,
	getAllDrawLayerIds,
	getLayerById,
	importLayerFromGeoJSON,
	layerHasFeatures,
} from "@/lib/helpers/ol";
import { useFilesStore } from "@/store/files";
import { useMapStore } from "@/store/map";
import { useProjectsStore } from "@/store/projects";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { useCallback, useEffect, useRef } from "react";

interface UseDrawLayerPersistenceOptions {
	debounceDelay?: number;
	autoSave?: boolean;
	autoRestore?: boolean;
}

export const useDrawLayerPersistence = (
	options: UseDrawLayerPersistenceOptions = {},
) => {
	const { debounceDelay = 1000, autoSave = true, autoRestore = true } = options;
	const map = useMapStore((state) => state.map);
	const mapReady = useMapStore((state) => state.isReady);
	const getProject = useProjectsStore((state) => state.getProject);
	const { addFile, getFile, deleteFile } = useFilesStore();

	const debounceTimersRef = useRef<
		Record<string, ReturnType<typeof setTimeout>>
	>({});
	const layerListenersRef = useRef<Record<string, () => void>>({});

	const saveDrawLayer = useCallback(
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
					`[useDrawLayerPersistence] Error saving layer ${layerId}:`,
					error,
				);
			}
		},
		[map, getProject, addFile, getFile, deleteFile],
	);

	const saveDrawLayerDebounced = useCallback(
		(layerId: string) => {
			if (!autoSave) return;

			clearTimeout(debounceTimersRef.current[layerId]);

			debounceTimersRef.current[layerId] = setTimeout(() => {
				saveDrawLayer(layerId);
				delete debounceTimersRef.current[layerId];
			}, debounceDelay);
		},
		[autoSave, debounceDelay, saveDrawLayer],
	);

	const restoreDrawLayers = useCallback(async () => {
		if (!map || !mapReady || !autoRestore) return;

		const project = getProject();
		if (!project) return;

		const drawLayerIds = getAllDrawLayerIds();

		await Promise.all(
			drawLayerIds.map(async (layerId) => {
				try {
					const layerFile = getFile(project.id, layerId);
					if (layerFile) {
						await importLayerFromGeoJSON(map, layerId, layerFile.file);
					}
				} catch (error) {
					console.error(
						`[useDrawLayerPersistence] Error restoring layer ${layerId}:`,
						error,
					);
				}
			}),
		);
	}, [map, mapReady, autoRestore, getProject, getFile]);

	const saveAllDrawLayers = useCallback(async () => {
		if (!map) return;

		const drawLayerIds = getAllDrawLayerIds();
		await Promise.all(
			drawLayerIds
				.filter((layerId) => layerHasFeatures(map, layerId))
				.map((layerId) => saveDrawLayer(layerId)),
		);
	}, [map, saveDrawLayer]);

	const setupAutoSave = useCallback(() => {
		if (!map || !mapReady || !autoSave) return;

		Object.values(layerListenersRef.current).forEach((cleanup) => cleanup());
		layerListenersRef.current = {};

		getAllDrawLayerIds().forEach((layerId) => {
			const layer = getLayerById(
				map,
				layerId,
			) as VectorLayer<VectorSource> | null;
			const source = layer?.getSource();
			if (!source) return;

			const handleFeatureChange = () => saveDrawLayerDebounced(layerId);

			source.on("addfeature", handleFeatureChange);
			source.on("removefeature", handleFeatureChange);
			source.on("changefeature", handleFeatureChange);

			layerListenersRef.current[layerId] = () => {
				source.un("addfeature", handleFeatureChange);
				source.un("removefeature", handleFeatureChange);
				source.un("changefeature", handleFeatureChange);
			};
		});
	}, [map, mapReady, autoSave, saveDrawLayerDebounced]);

	useEffect(() => {
		setupAutoSave();
	}, [setupAutoSave]);

	useEffect(() => {
		const project = getProject();
		if (project) {
			restoreDrawLayers();
		}
	}, [getProject, restoreDrawLayers]);

	useEffect(() => {
		const currentTimers = debounceTimersRef.current;
		const currentListeners = layerListenersRef.current;

		return () => {
			Object.values(currentTimers).forEach((timer) => clearTimeout(timer));
			Object.values(currentListeners).forEach((cleanup) => cleanup());
		};
	}, []);

	return {
		saveDrawLayer,
		saveAllDrawLayers,
		restoreDrawLayers,
		setupAutoSave,
	};
};
