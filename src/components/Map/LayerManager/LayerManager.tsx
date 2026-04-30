"use client";

import { useLayerPersistence } from "@/components/Map/LayerManager/hooks/useLayerPersistence";
import { useMapReady } from "@/hooks/useMapReady";
import { FC, useEffect } from "react";

const LayerManager: FC = () => {
	const isMapReady = useMapReady();

	const {
		saveAllDrawLayers,
		setupAutoSave,
		saveAllUploadedLayers,
		flushPendingSaves,
	} = useLayerPersistence({
		debounceDelay: 1000,
		autoSave: true,
		autoRestore: true,
	});

	useEffect(() => {
		if (!isMapReady) return;

		setupAutoSave();

		const handleBeforeUnload = () => {
			flushPendingSaves();
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				flushPendingSaves();
				saveAllDrawLayers();
				saveAllUploadedLayers();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [
		isMapReady,
		setupAutoSave,
		saveAllDrawLayers,
		saveAllUploadedLayers,
		flushPendingSaves,
	]);

	return null;
};

export default LayerManager;
