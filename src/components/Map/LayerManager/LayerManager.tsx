"use client";

import { useLayerPersistence } from "@/hooks/use-layer-persistence";
import { useMapReady } from "@/hooks/use-map-ready";
import { FC, useEffect } from "react";

const LayerManager: FC = () => {
	const isMapReady = useMapReady();

	const { saveAllDrawLayers, setupAutoSave, saveAllUploadedLayers } =
		useLayerPersistence({
			debounceDelay: 1000,
			autoSave: true,
			autoRestore: true,
		});

	useEffect(() => {
		if (!isMapReady) return;

		setupAutoSave();

		const handleBeforeUnload = () => {
			saveAllDrawLayers();
			saveAllUploadedLayers();
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isMapReady, setupAutoSave, saveAllDrawLayers, saveAllUploadedLayers]);

	return null;
};

export default LayerManager;
