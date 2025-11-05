"use client";

import { Button } from "@/components/ui/button";
import { getLayerById } from "@/lib/helper/mapHelpers";
import { useMapStore } from "@/store/map";
import { LAYER_IDS } from "@/types/shared";
import { PolygonIcon } from "@phosphor-icons/react";
import { intersects } from "ol/extent";
import Draw from "ol/interaction/Draw.js";
import Modify from "ol/interaction/Modify.js";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";

const DrawProjectBoundaryButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const drawRef = useRef<Draw | null>(null);
	const modifyRef = useRef<Modify | null>(null);
	const [mode, setMode] = useState<"idle" | "drawing" | "modifying">("idle");

	const performIntersection = useCallback(() => {
		if (!map) return;

		const projectBoundaryLayer = getLayerById(map, LAYER_IDS.PROJECT_BOUNDARY);
		if (!projectBoundaryLayer?.getSource()) {
			console.error("Project Boundary Layer not found.");
			return;
		}

		const projectBoundarySource = projectBoundaryLayer.getSource()!;
		const boundaryFeatures = projectBoundarySource.getFeatures();

		if (boundaryFeatures.length === 0) {
			getLayerById(map, LAYER_IDS.PROJECT_BTF_PLANNING)?.getSource()?.clear();
			return;
		}

		const rabimoLayer = getLayerById(map, LAYER_IDS.RABIMO_INPUT_2025);
		if (!rabimoLayer?.getSource()) {
			console.warn("Rabimo Input Layer not found.");
			return;
		}

		let planningLayer = getLayerById(map, LAYER_IDS.PROJECT_BTF_PLANNING);
		let planningSource: VectorSource;

		if (!planningLayer) {
			planningSource = new VectorSource();
			planningLayer = new VectorLayer({
				source: planningSource,
			});
			planningLayer.set("id", LAYER_IDS.PROJECT_BTF_PLANNING);
			map.addLayer(planningLayer);
		} else {
			planningSource = planningLayer.getSource()!;
		}

		planningSource.clear();

		rabimoLayer.getSource()!.forEachFeature((rabimoFeature) => {
			const rabimoGeometry = rabimoFeature.getGeometry();
			if (!rabimoGeometry) return;

			const intersectsAny = boundaryFeatures.some((boundaryFeature) => {
				const drawnGeometry = boundaryFeature.getGeometry();
				if (!drawnGeometry) return false;

				return (
					intersects(drawnGeometry.getExtent(), rabimoGeometry.getExtent()) &&
					drawnGeometry.intersectsExtent(rabimoGeometry.getExtent())
				);
			});

			if (intersectsAny) {
				planningSource.addFeature(rabimoFeature.clone());
			}
		});
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
	}, [map]);

	const startDrawMode = useCallback(() => {
		const projectBoundaryLayer = getLayerById(map, LAYER_IDS.PROJECT_BOUNDARY);
		const source = projectBoundaryLayer?.getSource();
		if (!source) return;

		removeInteractions();

		drawRef.current = new Draw({ source, type: "Polygon" });

		const handleFeatureAdded = () => {
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

			performIntersection();

			modifyRef.current = new Modify({ source });
			modifyRef.current.on("modifyend", () => {
				performIntersection();
			});

			map.addInteraction(modifyRef.current);
			setMode("modifying");
		};

		drawRef.current.on("drawend", () => {
			source.on("addfeature", handleFeatureAdded);
		});

		map!.addInteraction(drawRef.current);
		setMode("drawing");
	}, [map, removeInteractions, performIntersection]);

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
		if (mode === "drawing") return "Stop zeichnen";
		if (mode === "modifying") return "Stop bearbeiten";
		return "Fläche zeichnen";
	};

	return (
		<Button variant="outline" onClick={handleButtonClick}>
			<PolygonIcon />
			{getButtonText()}
		</Button>
	);
};

export default DrawProjectBoundaryButton;
