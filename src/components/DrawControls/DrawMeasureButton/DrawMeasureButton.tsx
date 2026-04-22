"use client";

import { Button } from "@/components/ui/button";
import { getLayerById } from "@/lib/helpers/ol";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import booleanIntersects from "@turf/boolean-intersects";
import intersect from "@turf/intersect";
import { PolygonIcon } from "@phosphor-icons/react";
import GeoJSON from "ol/format/GeoJSON.js";
import Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import Draw from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import { FC, useEffect, useRef } from "react";

interface DrawMeasureButtonProps {
	geometryType?: "Point" | "LineString" | "Polygon" | "Circle";
}

const DrawMeasureButton: FC<DrawMeasureButtonProps> = ({
	geometryType = "Polygon",
}) => {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);
	const isDrawing = useUiStore((state) => state.isDrawing);
	const setIsDrawing = useUiStore((state) => state.setIsDrawing);
	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);
	const createScenario = useScenarioStore((state) => state.createScenario);
	const addMeasure = useScenarioStore((state) => state.addMeasure);
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);

	const drawRef = useRef<Draw | null>(null);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		setLayerVisibility(drawLayerId, true);
		setLayerVisibility(LAYER_IDS.PROJECT_BTF_PLANNING, true);
	}, [map, drawLayerId, setLayerVisibility]);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		const removeDrawInteraction = () => {
			if (drawRef.current) {
				map.removeInteraction(drawRef.current);
				drawRef.current = null;
			}
		};
		removeDrawInteraction();

		return () => {
			removeDrawInteraction();
		};
	}, [map, drawLayerId]);

	useEffect(() => {
		if (!isDrawing && drawRef.current && map) {
			map.removeInteraction(drawRef.current);
			drawRef.current = null;
		}
	}, [isDrawing, map]);

	useEffect(() => {
		if (activeScenarioId) return;
		createScenario("Default Scenario");
	}, [activeScenarioId, createScenario]);

	const toggleDraw = () => {
		if (!map) return;

		if (drawRef.current) {
			map.removeInteraction(drawRef.current);
			drawRef.current = null;
			setIsDrawing(false);
			return;
		}

		resetDrawInteractions();

		const layer = map
			.getAllLayers()
			.find((l) => l.get("id") === drawLayerId) as VectorLayer<VectorSource>;

		if (!layer || !(layer.getSource() instanceof VectorSource)) {
			console.error("Layer not found or is not a vector layer");
			return;
		}

		drawRef.current = new Draw({
			source: layer.getSource()!,
			type: geometryType,
		});

		drawRef.current.on("drawend", (event) => {
			console.log("[DrawMeasureButton] drawend", {
				drawLayerId,
				geometryType,
			});

			let scenarioId = useScenarioStore.getState().activeScenarioId;

			if (!scenarioId) {
				useScenarioStore.getState().createScenario("Default Scenario");
				scenarioId = useScenarioStore.getState().activeScenarioId;
			}

			if (!scenarioId) return;

			console.log("[DrawMeasureButton] active scenario resolved", {
				scenarioId,
			});

			const source = layer.getSource();
			if (!source) return;
			const drawnFeature = event.feature;

			const processDrawnFeature = () => {
				const planningLayer = getLayerById(
					map,
					LAYER_IDS.PROJECT_BTF_PLANNING,
				) as VectorLayer<VectorSource> | null;
				const planningSource = planningLayer?.getSource();
				if (!planningSource) {
					source.removeFeature(drawnFeature);
					return;
				}

				const planningFeatures = planningSource.getFeatures();
				if (planningFeatures.length === 0) {
					source.removeFeature(drawnFeature);
					console.warn(
						"[DrawMeasureButton] draw rejected: no BTF planning features available",
					);
					return;
				}

				console.log("[DrawMeasureButton] planning features", {
					count: planningFeatures.length,
				});

				const projection = map.getView().getProjection();
				const geojson = new GeoJSON();
				const measureGeoJSON = geojson.writeFeatureObject(drawnFeature, {
					featureProjection: projection,
					dataProjection: "EPSG:4326",
				});

				const clippedFeatures: Feature<Geometry>[] = [];

				let intersectedPlanningFeatures = 0;

				planningFeatures.forEach((planningFeature) => {
					const planningGeometry = planningFeature.getGeometry();
					const measureGeometry = drawnFeature.getGeometry();

					if (!planningGeometry || !measureGeometry) return;
					if (!planningGeometry.intersectsExtent(measureGeometry.getExtent())) {
						return;
					}

					const planningGeoJSON = geojson.writeFeatureObject(planningFeature, {
						featureProjection: projection,
						dataProjection: "EPSG:4326",
					});

					if (!booleanIntersects(measureGeoJSON, planningGeoJSON)) return;
					intersectedPlanningFeatures++;

					const clipped = intersect({
						type: "FeatureCollection",
						features: [measureGeoJSON, planningGeoJSON],
					} as any);

					if (!clipped) return;

					const clippedFeatureList = geojson.readFeatures(clipped, {
						dataProjection: "EPSG:4326",
						featureProjection: projection,
					});

					clippedFeatures.push(...clippedFeatureList);
				});

				source.removeFeature(drawnFeature);

				console.log("[DrawMeasureButton] splitting result", {
					intersectedPlanningFeatures,
					clippedFeatureCount: clippedFeatures.length,
				});

				if (clippedFeatures.length === 0) {
					console.warn(
						"[DrawMeasureButton] draw rejected: geometry is outside BTF planning layer",
					);
					return;
				}

				clippedFeatures.forEach((clippedFeature, index) => {
					source.addFeature(clippedFeature);

					const featureObject = geojson.writeFeatureObject(clippedFeature, {
						featureProjection: projection,
						dataProjection: "EPSG:4326",
					});

					const measurePayload = {
						id: `measure-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
						createdAt: Date.now(),
						geometryType,
						drawLayerId,
						feature: featureObject,
					};

					console.log("[DrawMeasureButton] addMeasure payload", {
						scenarioId,
						measureId: measurePayload.id,
						createdAt: measurePayload.createdAt,
						geometryType: measurePayload.geometryType,
						drawLayerId: measurePayload.drawLayerId,
						featureType: measurePayload.feature.geometry?.type,
					});

					addMeasure(scenarioId, measurePayload);
				});
			};

			if (source.getFeatures().includes(drawnFeature)) {
				processDrawnFeature();
				return;
			}

			setTimeout(() => {
				if (!source.getFeatures().includes(drawnFeature)) {
					console.warn(
						"[DrawMeasureButton] drawn feature was not found in source after drawend",
					);
					return;
				}

				processDrawnFeature();
			}, 0);
		});

		map.addInteraction(drawRef.current);
		setIsDrawing(true);
	};

	return (
		<Button variant="outline" onClick={toggleDraw}>
			<PolygonIcon />
			{isDrawing ? "Stop Zeichnen" : "Maßnahme zeichnen"}
		</Button>
	);
};

export default DrawMeasureButton;
