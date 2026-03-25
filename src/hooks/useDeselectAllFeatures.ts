"use client";

import { getLayerById } from "@/lib/helpers/ol";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import Select from "ol/interaction/Select.js";
import { Vector as VectorSource } from "ol/source.js";
import { useCallback, useRef } from "react";

export function useDeselectAllFeatures() {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const selectInteractionRef = useRef<Select | null>(null);

	const deselectAllFeatures = useCallback(() => {
		if (!map || !drawLayerId) return;

		// 1. Clear current OL selection state
		if (selectInteractionRef?.current) {
			selectInteractionRef.current.getFeatures().clear();
		}

		// 2. Clear the draw layer that contains the copied/selected features
		const drawLayer = getLayerById(map, drawLayerId);
		if (drawLayer) {
			const source = drawLayer.getSource();
			if (source instanceof VectorSource) {
				source.clear();
				source.changed();
			}
		}
	}, [map, drawLayerId, selectInteractionRef]);

	return { deselectAllFeatures };
}
