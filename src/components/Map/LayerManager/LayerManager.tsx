"use client";

import { useLayerPersistence } from "@/hooks/use-layer-persistence";
import { useMapReady } from "@/hooks/use-map-ready";
import { useProjectsStore } from "@/store/projects";
import { FC, useEffect } from "react";

const LayerManager: FC = () => {
	const isMapReady = useMapReady();
	const getProject = useProjectsStore((state) => state.getProject);

	const {
		saveAllDrawLayers,
		restoreDrawLayers,
		setupAutoSave,
		saveAllUploadedLayers,
		restoreUploadedLayers,
	} = useLayerPersistence({
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
			restoreUploadedLayers();
		}

		const handleBeforeUnload = () => {
			saveAllDrawLayers();
			saveAllUploadedLayers();
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [
		isMapReady,
		setupAutoSave,
		restoreDrawLayers,
		restoreUploadedLayers,
		getProject,
		saveAllDrawLayers,
		saveAllUploadedLayers,
	]);

	return null;
};

export default LayerManager;
