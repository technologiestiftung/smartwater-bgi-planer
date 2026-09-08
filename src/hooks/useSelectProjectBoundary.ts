"use client";

import { getLayerById } from "@/lib/helpers/ol";
import { useUiStore } from "@/store";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { LAYER_IDS } from "@/types/shared";
import VectorSource from "ol/source/Vector";
import { useCallback } from "react";

export function useSelectProjectBoundary() {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);

	const selectProjectBoundary = useCallback(() => {
		if (!map || !drawLayerId) return;

		const boundaryLayer = getLayerById(map, LAYER_IDS.PROJECT_BOUNDARY);
		const drawLayer = getLayerById(map, drawLayerId);

		if (!boundaryLayer || !drawLayer) return;

		const boundarySource = boundaryLayer.getSource();
		const drawSource = drawLayer.getSource();

		if (
			!(boundarySource instanceof VectorSource) ||
			!(drawSource instanceof VectorSource)
		)
			return;

		const boundaryFeatures = boundarySource.getFeatures();
		if (!boundaryFeatures.length) return;

		resetDrawInteractions();

		drawSource.clear();

		boundaryFeatures.forEach((feature) => {
			drawSource.addFeature(feature.clone());
		});

		drawSource.changed();
	}, [map, drawLayerId, resetDrawInteractions]);

	return { selectProjectBoundary };
}
