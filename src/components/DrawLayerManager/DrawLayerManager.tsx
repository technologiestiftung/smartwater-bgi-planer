"use client";

import { useMapReady } from "@/hooks/use-map-ready";
import { useDrawLayerPersistence } from "@/hooks/use-draw-layer-persistence";
import { useProjectsStore } from "@/store/projects";
import { FC, useEffect } from "react";

const DrawLayerManager: FC = () => {
	const isMapReady = useMapReady();
	const getProject = useProjectsStore((state) => state.getProject);

	const { saveAllDrawLayers, restoreDrawLayers, setupAutoSave } =
		useDrawLayerPersistence({
			debounceDelay: 1000,
			autoSave: true,
			autoRestore: true,
		});

	useEffect(() => {
		if (!isMapReady) return;

		setupAutoSave();
		const project = getProject();

		if (project) {
			console.log(
				`[DrawLayerManager] Restoring draw layers for project ${project.id}`,
			);
			restoreDrawLayers();
		}
	}, [isMapReady, setupAutoSave, restoreDrawLayers, getProject]);

	useEffect(() => {
		if (!isMapReady) return;

		const project = getProject();

		if (project) {
			console.log(
				`[DrawLayerManager] Project changed to ${project.id}, restoring draw layers`,
			);
			restoreDrawLayers();
		}
	}, [getProject, restoreDrawLayers, isMapReady]);

	useEffect(() => {
		if (!isMapReady) return;

		const handleBeforeUnload = () => {
			saveAllDrawLayers();
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isMapReady, saveAllDrawLayers]);

	return null;
};

export default DrawLayerManager;
