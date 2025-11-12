import {
	drawLayerHasFeatures,
	exportDrawLayerAsGeoJSON,
	getAllDrawLayerIds,
	importDrawLayerFromGeoJSON,
} from "@/lib/helpers/ol/drawLayer";
import { getLayerById } from "@/lib/helpers/ol/map";
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

/**
 * Hook for managing draw layers persistence in IndexedDB.
 *
 * @param options - Options for managing draw layer persistence
 * @property debounceDelay - Debounce delay for saving draw layers (default 1000ms)
 * @property autoSave - Enables auto-saving draw layers when map changes (default true)
 * @property autoRestore - Enables auto-restoring draw layers when project changes (default true)
 * @returns - An object containing the following methods:
 *   saveDrawLayer - Saves a single draw layer to IndexedDB
 *   saveDrawLayerDebounced - Saves a draw layer with debouncing to avoid excessive saves
 *   restoreDrawLayers - Restores all draw layers from IndexedDB for the current project
 *   setupAutoSave - Sets up auto-save listeners for all draw layers
 *   restoreDrawLayers - Restores all draw layers from IndexedDB for the current project
 */
export const useDrawLayerPersistence = (
	options: UseDrawLayerPersistenceOptions = {},
) => {
	const { debounceDelay = 1000, autoSave = true, autoRestore = true } = options;
	const map = useMapStore((state) => state.map);
	const getProject = useProjectsStore((state) => state.getProject);
	const { addFile, getFile, deleteFile } = useFilesStore();

	// Refs for debouncing and cleanup
	const debounceTimersRef = useRef<
		Record<string, ReturnType<typeof setTimeout>>
	>({});
	const layerListenersRef = useRef<Record<string, () => void>>({});

	const saveDrawLayer = useCallback(
		async (layerId: string) => {
			if (!map) return;

			const project = getProject();
			if (!project) {
				console.warn(
					`[useDrawLayerPersistence] No active project for saving layer ${layerId}`,
				);
				return;
			}

			try {
				const geoJsonFile = exportDrawLayerAsGeoJSON(map, layerId);

				if (geoJsonFile) {
					await addFile(project.id, layerId, geoJsonFile);
					console.log(
						`[useDrawLayerPersistence] Saved layer ${layerId} with ${geoJsonFile.size} bytes`,
					);
				} else {
					const existingFile = getFile(project.id, layerId);
					if (existingFile) {
						await deleteFile(project.id, layerId);
						console.log(
							`[useDrawLayerPersistence] Removed empty layer file for ${layerId}`,
						);
					}
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

			// Clear existing timer for this layer
			if (debounceTimersRef.current[layerId]) {
				clearTimeout(debounceTimersRef.current[layerId]);
			}

			// Set new timer
			debounceTimersRef.current[layerId] = setTimeout(() => {
				saveDrawLayer(layerId);
				delete debounceTimersRef.current[layerId];
			}, debounceDelay);
		},
		[autoSave, debounceDelay, saveDrawLayer],
	);

	const restoreDrawLayers = useCallback(async () => {
		if (!map || !autoRestore) return;

		const project = getProject();
		if (!project) {
			console.warn(
				"[useDrawLayerPersistence] No active project for restoration",
			);
			return;
		}

		const drawLayerIds = getAllDrawLayerIds();
		let restoredCount = 0;

		for (const layerId of drawLayerIds) {
			try {
				const layerFile = getFile(project.id, layerId);

				if (layerFile) {
					const success = await importDrawLayerFromGeoJSON(
						map,
						layerId,
						layerFile.file,
					);
					if (success) {
						restoredCount++;
					}
				}
			} catch (error) {
				console.error(
					`[useDrawLayerPersistence] Error restoring layer ${layerId}:`,
					error,
				);
			}
		}

		if (restoredCount > 0) {
			console.log(
				`[useDrawLayerPersistence] Restored ${restoredCount} draw layers for project ${project.id}`,
			);
		}
	}, [map, autoRestore, getProject, getFile]);

	const saveAllDrawLayers = useCallback(async () => {
		if (!map) return;

		const drawLayerIds = getAllDrawLayerIds();
		const savePromises = drawLayerIds
			.filter((layerId) => drawLayerHasFeatures(map, layerId))
			.map((layerId) => saveDrawLayer(layerId));

		await Promise.all(savePromises);
	}, [map, saveDrawLayer]);

	const setupAutoSave = useCallback(() => {
		if (!map || !autoSave) return;

		Object.values(layerListenersRef.current).forEach((cleanup) => cleanup());
		layerListenersRef.current = {};

		const drawLayerIds = getAllDrawLayerIds();

		drawLayerIds.forEach((layerId) => {
			const layer = getLayerById(
				map,
				layerId,
			) as VectorLayer<VectorSource> | null;

			if (!layer) return;

			const source = layer.getSource();
			if (!source) return;

			const handleFeatureChange = () => saveDrawLayerDebounced(layerId);

			// Listen to all feature events
			source.on("addfeature", handleFeatureChange);
			source.on("removefeature", handleFeatureChange);
			source.on("changefeature", handleFeatureChange);

			// Store cleanup function
			layerListenersRef.current[layerId] = () => {
				source.un("addfeature", handleFeatureChange);
				source.un("removefeature", handleFeatureChange);
				source.un("changefeature", handleFeatureChange);
			};
		});

		console.log(
			`[useDrawLayerPersistence] Auto-save enabled for ${drawLayerIds.length} draw layers`,
		);
	}, [map, autoSave, saveDrawLayerDebounced]);

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
