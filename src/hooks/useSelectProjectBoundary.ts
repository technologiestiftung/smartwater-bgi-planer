"use client";

import { useCallback, useRef } from "react";
import { getLayerById } from "@/lib/helpers/ol";
import { useMapStore } from "@/store/map";
import { useLayersStore } from "@/store/layers";
import VectorSource from "ol/source/Vector";
import Modify from "ol/interaction/Modify";
import { LAYER_IDS } from "@/types/shared";
import Draw from "ol/interaction/Draw.js";
import { useUiStore } from "@/store";
import { performProjectBoundaryIntersection } from "@/lib/helpers/projectBoundary";

export function useSelectProjectBoundary() {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const setIsDrawing = useUiStore((state) => state.setIsDrawing);
	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);
	const drawRef = useRef<Draw | null>(null);
	const modifyRef = useRef<Modify | null>(null);

	const performIntersection = useCallback(() => {
		performProjectBoundaryIntersection(map);
	}, [map]);

	const removeInteractions = useCallback(() => {
		if (drawRef.current) {
			map?.removeInteraction(drawRef.current);
			drawRef.current = null;
		}
		if (modifyRef.current) {
			map?.removeInteraction(modifyRef.current);
			modifyRef.current = null;
		}
		setIsDrawing(false);
	}, [map, setIsDrawing]);

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

		// ✅ reset previous interactions
		resetDrawInteractions();
		removeInteractions();

		// ✅ clear previous selection
		drawSource.clear();

		// ✅ clone boundary into draw layer
		boundaryFeatures.forEach((feature) => {
			drawSource.addFeature(feature.clone());
		});

		drawSource.changed();

		// ✅ run your existing logic
		performIntersection();

		// ✅ enable modify interaction
		modifyRef.current = new Modify({ source: drawSource });

		modifyRef.current.on("modifyend", () => {
			performIntersection();
		});

		map.addInteraction(modifyRef.current);
	}, [
		map,
		drawLayerId,
		modifyRef,
		removeInteractions,
		resetDrawInteractions,
		performIntersection,
	]);

	return { selectProjectBoundary };
}
