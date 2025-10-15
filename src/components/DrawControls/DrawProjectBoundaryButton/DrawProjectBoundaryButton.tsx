"use client";

import { Button } from "@/components/ui/button";
import { getLayerById } from "@/lib/helper/mapHelpers";
import { useMapStore } from "@/store/map";
import { LAYER_IDS } from "@/types/shared";
import { Feature } from "ol";
import { intersects } from "ol/extent";
import GeoJSON from "ol/format/GeoJSON.js";
import Draw from "ol/interaction/Draw.js";
import Modify from "ol/interaction/Modify.js";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

const DrawProjectBoundaryButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const drawRef = useRef<Draw | null>(null);
	const modifyRef = useRef<Modify | null>(null);
	const [mode, setMode] = useState<"none" | "draw" | "modify" | "drawn">(
		"none",
	);

	const getBoundaryFeature = useCallback(() => {
		const layer = getLayerById(map, LAYER_IDS.PROJECT_BOUNDARY);
		return layer?.getSource()?.getFeatures()[0];
	}, [map]);

	const boundaryExists = useMemo(
		() => !!getBoundaryFeature(),
		[getBoundaryFeature],
	);

	const performIntersection = useCallback(
		(featureToUse?: Feature) => {
			if (!map) return;

			const projectBoundaryLayer = getLayerById(
				map,
				LAYER_IDS.PROJECT_BOUNDARY,
			);
			if (!projectBoundaryLayer?.getSource()) {
				console.error("Project Boundary Layer not found.");
				return;
			}

			const projectBoundarySource = projectBoundaryLayer.getSource()!;
			const currentBoundaryFeature =
				featureToUse || projectBoundarySource.getFeatures()[0];

			if (!currentBoundaryFeature) {
				getLayerById(map, "project_btf_planning")?.getSource()?.clear();
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
				console.log("Created 'project_btf_planning' layer.");
			} else {
				planningSource = planningLayer.getSource()!;
			}

			planningSource.clear();

			const drawnGeometry = currentBoundaryFeature.getGeometry();
			if (!drawnGeometry) {
				console.error("Boundary feature has no geometry.");
				return;
			}

			rabimoLayer.getSource()!.forEachFeature((rabimoFeature) => {
				const rabimoGeometry = rabimoFeature.getGeometry();
				if (
					rabimoGeometry &&
					intersects(drawnGeometry.getExtent(), rabimoGeometry.getExtent()) &&
					drawnGeometry.intersectsExtent(rabimoGeometry.getExtent())
				) {
					planningSource.addFeature(rabimoFeature.clone());
				}
			});

			console.log(
				`Added ${
					planningSource.getFeatures().length
				} features to planning layer.`,
			);
		},
		[map],
	);

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

	const startModifyMode = useCallback(() => {
		const projectBoundaryLayer = getLayerById(map, LAYER_IDS.PROJECT_BOUNDARY);
		const source = projectBoundaryLayer?.getSource();
		if (!source) return;

		removeInteractions();
		modifyRef.current = new Modify({ source });
		modifyRef.current.on("modifyend", () => {
			performIntersection();
		});
		map!.addInteraction(modifyRef.current);
		setMode("modify");
	}, [map, removeInteractions, performIntersection]);

	const startDrawMode = useCallback(() => {
		const projectBoundaryLayer = getLayerById(map, LAYER_IDS.PROJECT_BOUNDARY);
		const source = projectBoundaryLayer?.getSource();
		if (!source) return;

		removeInteractions();
		source.clear(); // Clear any existing boundary

		drawRef.current = new Draw({ source, type: "Polygon" });
		drawRef.current.on("drawend", (event) => {
			const geojson = new GeoJSON().writeFeatureObject(event.feature);
			console.log("GeoJSON:", geojson);

			performIntersection(event.feature);
			setMode("drawn"); // Trigger transition to modify mode
		});
		map!.addInteraction(drawRef.current);
		setMode("draw");
	}, [map, removeInteractions, performIntersection]);

	const toggleInteraction = useCallback(() => {
		if (!map) return;

		if (mode === "none") {
			if (boundaryExists) {
				startModifyMode();
			} else {
				startDrawMode();
			}
		} else {
			removeInteractions();
			setMode("none");
		}
	}, [
		map,
		mode,
		boundaryExists,
		startModifyMode,
		startDrawMode,
		removeInteractions,
	]);

	useEffect(() => {
		if (!map) return;

		if (getBoundaryFeature()) {
			performIntersection();
		}

		return removeInteractions;
	}, [map, getBoundaryFeature, performIntersection, removeInteractions]);

	useEffect(() => {
		if (mode === "drawn") {
			startModifyMode();
		}
	}, [mode, startModifyMode]);

	const getButtonText = () => {
		if (mode === "draw") return "Stop Drawing";
		if (mode === "modify") return "Stop Modifying";
		return boundaryExists ? "Modify Project Boundary" : "Draw Project Boundary";
	};

	return <Button onClick={toggleInteraction}>{getButtonText()}</Button>;
};

export default DrawProjectBoundaryButton;
