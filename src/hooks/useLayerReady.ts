"use client";

import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import VectorLayer from "ol/layer/Vector";
import { useEffect, useState } from "react";

/**
 * Hook to check if a layer is loaded, visible, and has finished loading its data
 * For vector layers (WFS, GeoJSON), this also checks if the source has finished loading
 * @param layerId - The ID of the layer to check
 * @returns Object with isReady boolean and layer status
 */
export function useLayerReady(layerId: string) {
	const layers = useLayersStore((state) => state.layers);
	const map = useMapStore((state) => state.map);
	const [sourceState, setSourceState] = useState<
		"undefined" | "ready" | "loading" | "error"
	>("undefined");

	const layer = layers.get(layerId);

	useEffect(() => {
		if (!layer?.olLayer || !map) {
			return;
		}

		if (layer.olLayer instanceof VectorLayer) {
			const source = layer.olLayer.getSource();
			if (!source) {
				return;
			}

			const handleSourceChange = () => {
				const state = source.getState();
				const hasFeatures = source.getFeatures().length > 0;

				if (state === "ready" && hasFeatures) {
					setSourceState("ready");
				} else if (state === "error") {
					setSourceState("error");
				} else {
					setSourceState("loading");
				}
			};

			handleSourceChange();
			source.on("change", handleSourceChange);
			return () => {
				source.un("change", handleSourceChange);
			};
		}

		const timer = setTimeout(() => {
			setSourceState("ready");
		}, 0);

		return () => {
			clearTimeout(timer);
		};
	}, [layer, map, layerId]);

	if (!layer) {
		return {
			isReady: false,
			status: "initial" as const,
			isLoading: false,
			hasError: false,
			isVisible: false,
		};
	}

	const isLoaded = layer.status === "loaded";
	const isVisible = layer.visibility === true;
	const sourceReady = sourceState === "ready";
	const isReady = isLoaded && isVisible && sourceReady;

	return {
		isReady,
		status: layer.status,
		isLoading: layer.status === "loading" || (isLoaded && !sourceReady),
		hasError: layer.status === "error",
		isVisible,
		error: layer.error,
		sourceState,
	};
}
