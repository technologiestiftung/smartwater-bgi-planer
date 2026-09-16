"use client";

import { Button } from "@/components/ui/button";
import { useLayerReady } from "@/hooks/useLayerReady";
import { getLayerById } from "@/lib/helpers/ol";
import {
	ensureRabimoInputLoaded,
	getInputFeatures,
	performProjectBoundaryIntersection,
} from "@/lib/helpers/projectBoundary";
import { useMapStore } from "@/store/map";
import { useProjectStore } from "@/store/project";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import { PolygonIcon } from "@phosphor-icons/react";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import { FC, useCallback, useEffect, useRef, useState } from "react";

export const DrawProjectBoundaryButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const setInputFeatures = useProjectStore((state) => state.setInputFeatures);
	const setIsDrawing = useUiStore((state) => state.setIsDrawing);
	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);
	const drawRef = useRef<Draw | null>(null);
	const modifyRef = useRef<Modify | null>(null);
	const [mode, setMode] = useState<"idle" | "drawing" | "modifying">("idle");
	const isIntersecting = useUiStore((state) => state.isBoundaryIntersecting);
	const setIsIntersecting = useUiStore(
		(state) => state.setIsBoundaryIntersecting,
	);

	// Check if the BTF planning layer is ready
	const { isReady: isBTFLayerReady, isLoading: isBTFLayerLoading } =
		useLayerReady(LAYER_IDS.INPUT);

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

	const syncPlanningLayerFeatures = useCallback(() => {
		setInputFeatures(getInputFeatures(map));
	}, [map, setInputFeatures]);

	const performIntersection = useCallback(async () => {
		const boundaryExtent = getLayerById(map, LAYER_IDS.PROJECT_BOUNDARY)
			?.getSource()
			?.getExtent();

		setIsIntersecting(true);
		try {
			await ensureRabimoInputLoaded(map, boundaryExtent ?? null);
			performProjectBoundaryIntersection(map);
			syncPlanningLayerFeatures();
		} finally {
			setIsIntersecting(false);
		}
	}, [map, syncPlanningLayerFeatures, setIsIntersecting]);

	const startDrawMode = useCallback(() => {
		const projectBoundaryLayer = getLayerById(map, LAYER_IDS.PROJECT_BOUNDARY);
		const source = projectBoundaryLayer?.getSource();
		if (!source) return;

		resetDrawInteractions();
		removeInteractions();

		drawRef.current = new Draw({ source, type: "Polygon" });

		const handleFeatureAdded = async () => {
			source.un("addfeature", handleFeatureAdded);
			if (!map) return;

			if (drawRef.current) {
				map.removeInteraction(drawRef.current);
				drawRef.current = null;
			}
			if (modifyRef.current) {
				map.removeInteraction(modifyRef.current);
				modifyRef.current = null;
			}

			await performIntersection();

			modifyRef.current = new Modify({ source });
			modifyRef.current.on("modifyend", () => {
				void performIntersection();
			});

			map.addInteraction(modifyRef.current);
			setMode("modifying");
		};

		drawRef.current.on("drawend", () => {
			source.on("addfeature", handleFeatureAdded);
		});

		map!.addInteraction(drawRef.current);
		setMode("drawing");
		setIsDrawing(true);
	}, [
		map,
		removeInteractions,
		performIntersection,
		resetDrawInteractions,
		setIsDrawing,
	]);

	const handleButtonClick = useCallback(() => {
		if (!map) return;

		if (mode === "idle") {
			startDrawMode();
		} else {
			removeInteractions();
			setMode("idle");
		}
	}, [map, mode, startDrawMode, removeInteractions]);

	useEffect(() => {
		return removeInteractions;
	}, [removeInteractions]);

	const getButtonText = () => {
		if (isBTFLayerLoading || isIntersecting) return "Layer lädt...";
		if (mode === "drawing") return "Stop zeichnen";
		if (mode === "modifying") return "Stop bearbeiten";
		return "Fläche zeichnen";
	};

	const isButtonDisabled = !isBTFLayerReady || !map || isIntersecting;

	return (
		<Button
			variant="outline"
			onClick={handleButtonClick}
			disabled={isButtonDisabled}
		>
			<PolygonIcon />
			{getButtonText()}
		</Button>
	);
};
