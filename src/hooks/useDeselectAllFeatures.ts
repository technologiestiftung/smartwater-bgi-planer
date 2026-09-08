"use client";

import { getLayerById } from "@/lib/helpers/ol";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { Vector as VectorSource } from "ol/source";
import { useCallback } from "react";

export function useDeselectAllFeatures() {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);

	const clearDrawLayerFeatures = useCallback(() => {
		if (!map || !drawLayerId) return;

		const drawLayer = getLayerById(map, drawLayerId);
		if (!drawLayer) return;

		const source = drawLayer.getSource();
		if (source instanceof VectorSource) {
			source.clear();
			source.changed();
		}
	}, [map, drawLayerId]);

	return { clearDrawLayerFeatures };
}
