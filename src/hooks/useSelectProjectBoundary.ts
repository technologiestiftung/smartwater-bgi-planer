"use client";

import { getLayerById } from "@/lib/helpers/ol";
import {
	getInputFeatures,
	performProjectBoundaryIntersection,
} from "@/lib/helpers/projectBoundary";
import { useUiStore } from "@/store";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useProjectStore } from "@/store/project";
import { LAYER_IDS } from "@/types/shared";
import Draw from "ol/interaction/Draw.js";
import Modify from "ol/interaction/Modify";
import VectorSource from "ol/source/Vector";
import { useCallback, useRef } from "react";

export function useSelectProjectBoundary() {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const setInputFeatures = useProjectStore((state) => state.setInputFeatures);
	const setIsDrawing = useUiStore((state) => state.setIsDrawing);
	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);
	const drawRef = useRef<Draw | null>(null);
	const modifyRef = useRef<Modify | null>(null);

	const performIntersection = useCallback(() => {
		performProjectBoundaryIntersection(map);
		setInputFeatures(getInputFeatures(map));
	}, [map, setInputFeatures]);

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

		resetDrawInteractions();
		removeInteractions();

		drawSource.clear();

		boundaryFeatures.forEach((feature) => {
			drawSource.addFeature(feature.clone());
		});

		drawSource.changed();

		performIntersection();

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
