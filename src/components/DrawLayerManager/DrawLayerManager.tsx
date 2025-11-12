"use client";

import { useDrawLayerPersistence } from "@/hooks/use-draw-layer-persistence";
import { useMapReady } from "@/hooks/use-map-ready";
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
			restoreDrawLayers();
		}

		const handleBeforeUnload = () => {
			saveAllDrawLayers();
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [
		isMapReady,
		setupAutoSave,
		restoreDrawLayers,
		getProject,
		saveAllDrawLayers,
	]);

	return null;
};

export default DrawLayerManager;
