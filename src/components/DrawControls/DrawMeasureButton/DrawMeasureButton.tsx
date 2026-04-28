"use client";

import { Button } from "@/components/ui/button";
import measuresConfig from "@/config/measuresConfig.json";
import { createMeasureConfigMap } from "@/lib/helpers/measures/config";
import { getInitialMeasureValues } from "@/lib/helpers/measures/values";
import { getLayerById } from "@/lib/helpers/ol";
import { formatArea, formatLength } from "@/lib/helpers/ol/format";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import type { MeasureConfig } from "@/types/measures";
import { LAYER_IDS } from "@/types/shared";
import { PolygonIcon } from "@phosphor-icons/react";
import booleanIntersects from "@turf/boolean-intersects";
import intersect from "@turf/intersect";
import type { FeatureLike } from "ol/Feature";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON.js";
import type Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString.js";
import Point from "ol/geom/Point.js";
import Polygon from "ol/geom/Polygon.js";
import Draw from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import CircleStyle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import Text from "ol/style/Text.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";

const measureConfigById = createMeasureConfigMap(
	measuresConfig as MeasureConfig[],
);

const resolveMeasureLayerConfigId = (
	layerConfigId: string | null,
	drawLayerId: string | null,
	index: number,
) => layerConfigId ?? drawLayerId ?? `measure-${index}`;

const resolveMeasureTitle = (
	currentLayerConfig:
		| ReturnType<typeof useLayersStore.getState>["layerConfig"][number]
		| undefined,
) => currentLayerConfig?.name ?? currentLayerConfig?.question ?? "Maßnahme";

const resolveMeasureKey = (
	measureConfig: MeasureConfig | null,
	currentLayerConfig:
		| ReturnType<typeof useLayersStore.getState>["layerConfig"][number]
		| undefined,
) => measureConfig?.key ?? currentLayerConfig?.name ?? "measure";

const getMeasureFeatureObject = (
	geojson: GeoJSON,
	clippedFeature: Feature<Geometry>,
	projection: any,
) =>
	geojson.writeFeatureObject(clippedFeature, {
		featureProjection: projection,
		dataProjection: "EPSG:4326",
	});

const createMeasurePayload = ({
	clippedFeature,
	index,
	geojson,
	projection,
	geometryType,
	drawLayerId,
	layerConfigId,
	currentLayerConfig,
	measureConfig,
}: {
	clippedFeature: Feature<Geometry>;
	index: number;
	geojson: GeoJSON;
	projection: any;
	geometryType: "Point" | "LineString" | "Polygon" | "Circle";
	drawLayerId: string | null;
	layerConfigId: string | null;
	currentLayerConfig:
		| ReturnType<typeof useLayersStore.getState>["layerConfig"][number]
		| undefined;
	measureConfig: MeasureConfig | null;
}) => {
	const resolvedLayerConfigId = resolveMeasureLayerConfigId(
		layerConfigId,
		drawLayerId,
		index,
	);
	const title = resolveMeasureTitle(currentLayerConfig);
	const measureKey = resolveMeasureKey(measureConfig, currentLayerConfig);
	const feature = getMeasureFeatureObject(geojson, clippedFeature, projection);

	return {
		id: `measure-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
		createdAt: Date.now(),
		geometryType,
		drawLayerId,
		layerConfigId: resolvedLayerConfigId,
		measureKey,
		title,
		feature,
		values: measureConfig
			? getInitialMeasureValues(measureConfig, clippedFeature)
			: {},
	};
};

interface DrawMeasureButtonProps {
	geometryType?: "Point" | "LineString" | "Polygon" | "Circle";
}

interface LiveMeasureInfo {
	area: string;
	segmentLengths: string[];
}

const getSegmentLabelStyles = (polygon: Polygon) => {
	const ring = polygon.getCoordinates()[0] || [];
	const segmentStyles: Style[] = [];

	for (let index = 0; index < ring.length - 1; index++) {
		const start = ring[index];
		const end = ring[index + 1];
		const segment = new LineString([start, end]);
		const midpoint: [number, number] = [
			(start[0] + end[0]) / 2,
			(start[1] + end[1]) / 2,
		];

		segmentStyles.push(
			new Style({
				geometry: new Point(midpoint),
				text: new Text({
					text: formatLength(segment),
					font: "400 12px sans-serif",
					padding: [2, 4, 2, 4],
					fill: new Fill({ color: "#111827" }),
					backgroundFill: new Fill({ color: "rgba(255, 255, 255, 0.9)" }),
				}),
			}),
		);
	}

	return segmentStyles;
};

const getPolygonDrawStyles = (polygon: Polygon) => {
	const ring = polygon.getCoordinates()[0] || [];
	const vertexStyles = ring.slice(0, -1).map(
		(coordinate) =>
			new Style({
				geometry: new Point(coordinate),
				image: new CircleStyle({
					radius: 5,
					fill: new Fill({ color: "#0ea5e9" }),
					stroke: new Stroke({ color: "#ffffff", width: 2 }),
				}),
			}),
	);

	return [
		new Style({
			fill: new Fill({ color: "rgba(14, 165, 233, 0.25)" }),
			stroke: new Stroke({
				color: "rgba(14, 165, 233, 0.95)",
				width: 3,
				lineDash: [6, 6],
			}),
		}),
		...vertexStyles,
		...getSegmentLabelStyles(polygon),
	];
};

const getMeasureDrawStyles = (
	geometryType: DrawMeasureButtonProps["geometryType"],
) => {
	if (geometryType !== "Polygon") {
		return undefined;
	}

	return (feature: FeatureLike) => {
		if (!(feature instanceof Feature)) {
			return [];
		}

		const geometry = feature.getGeometry();
		if (!(geometry instanceof Polygon)) {
			return [];
		}

		return getPolygonDrawStyles(geometry);
	};
};

const DrawMeasureButton: FC<DrawMeasureButtonProps> = ({
	geometryType = "Polygon",
}) => {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);
	const isDrawing = useUiStore((state) => state.isDrawing);
	const setIsDrawing = useUiStore((state) => state.setIsDrawing);
	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);
	const openMeasureCard = useUiStore((state) => state.openMeasureCard);
	const createScenario = useScenarioStore((state) => state.createScenario);
	const addMeasure = useScenarioStore((state) => state.addMeasure);
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const [liveMeasureInfo, setLiveMeasureInfo] =
		useState<LiveMeasureInfo | null>(null);

	const drawRef = useRef<Draw | null>(null);
	const sketchGeometryRef = useRef<Geometry | null>(null);
	const sketchGeometryChangeHandlerRef = useRef<(() => void) | null>(null);

	const removeSketchGeometryListener = useCallback(() => {
		if (sketchGeometryRef.current && sketchGeometryChangeHandlerRef.current) {
			sketchGeometryRef.current.un(
				"change",
				sketchGeometryChangeHandlerRef.current,
			);
		}

		sketchGeometryRef.current = null;
		sketchGeometryChangeHandlerRef.current = null;
	}, []);

	const clearLiveMeasureInfo = useCallback(() => {
		removeSketchGeometryListener();
		setLiveMeasureInfo(null);
	}, [removeSketchGeometryListener]);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		setLayerVisibility(drawLayerId, true);
		setLayerVisibility(LAYER_IDS.PROJECT_BTF_PLANNING, true);
	}, [map, drawLayerId, setLayerVisibility]);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		const removeDrawInteraction = () => {
			clearLiveMeasureInfo();
			if (drawRef.current) {
				map.removeInteraction(drawRef.current);
				drawRef.current = null;
			}
		};
		removeDrawInteraction();

		return () => {
			removeDrawInteraction();
		};
	}, [map, drawLayerId, clearLiveMeasureInfo]);

	useEffect(() => {
		if (!isDrawing && drawRef.current && map) {
			clearLiveMeasureInfo();
			map.removeInteraction(drawRef.current);
			drawRef.current = null;
		}
	}, [isDrawing, map, clearLiveMeasureInfo]);

	useEffect(() => {
		if (activeScenarioId) return;
		createScenario("Default Scenario");
	}, [activeScenarioId, createScenario]);

	const toggleDraw = () => {
		if (!map) return;

		if (drawRef.current) {
			clearLiveMeasureInfo();
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
			style: getMeasureDrawStyles(geometryType),
		});

		drawRef.current.on("drawstart", (event) => {
			if (geometryType !== "Polygon") {
				return;
			}

			const geometry = event.feature.getGeometry();
			if (!(geometry instanceof Polygon)) {
				return;
			}

			removeSketchGeometryListener();
			sketchGeometryRef.current = geometry;

			const updateLiveMeasureInfo = () => {
				if (!(geometry instanceof Polygon)) {
					setLiveMeasureInfo(null);
					return;
				}

				const ring = geometry.getCoordinates()[0] || [];
				if (ring.length < 2) {
					setLiveMeasureInfo(null);
					return;
				}

				const segments: string[] = [];
				for (let index = 0; index < ring.length - 1; index++) {
					const segment = new LineString([ring[index], ring[index + 1]]);
					segments.push(`Kante ${index + 1}: ${formatLength(segment)}`);
				}

				setLiveMeasureInfo({
					area: formatArea(geometry),
					segmentLengths: segments,
				});
			};

			sketchGeometryChangeHandlerRef.current = updateLiveMeasureInfo;
			geometry.on("change", updateLiveMeasureInfo);
			updateLiveMeasureInfo();
		});

		drawRef.current.on("drawend", (event) => {
			clearLiveMeasureInfo();
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

			const currentLayerConfig = layerConfig.find(
				(config) => config.id === layerConfigId,
			);
			const measureConfig = layerConfigId
				? measureConfigById.get(layerConfigId)
				: null;

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
					const measurePayload = createMeasurePayload({
						clippedFeature,
						index,
						geojson,
						projection,
						geometryType,
						drawLayerId: drawLayerId ?? null,
						layerConfigId: layerConfigId ?? null,
						currentLayerConfig,
						measureConfig: measureConfig ?? null,
					});

					clippedFeature.set("measureId", measurePayload.id);
					clippedFeature.set(
						"measureLayerConfigId",
						measurePayload.layerConfigId,
					);
					clippedFeature.set("measureKey", measurePayload.measureKey);
					clippedFeature.set("measureTitle", measurePayload.title);
					Object.entries(measurePayload.values).forEach(([key, value]) => {
						if (value !== null && value !== undefined && value !== "") {
							clippedFeature.set(key, value);
						}
					});
					source.addFeature(clippedFeature);

					console.log("[DrawMeasureButton] addMeasure payload", {
						scenarioId,
						measureId: measurePayload.id,
						createdAt: measurePayload.createdAt,
						geometryType: measurePayload.geometryType,
						drawLayerId: measurePayload.drawLayerId,
						featureType: measurePayload.feature.geometry?.type,
					});

					addMeasure(scenarioId, measurePayload);
					openMeasureCard(measurePayload.id);
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

	const visibleSegments = liveMeasureInfo?.segmentLengths.slice(0, 4) || [];
	const hiddenSegmentsCount = Math.max(
		0,
		(liveMeasureInfo?.segmentLengths.length || 0) - visibleSegments.length,
	);

	return (
		<div className="relative">
			<Button variant="outline" onClick={toggleDraw}>
				<PolygonIcon />
				{isDrawing ? "Stop Zeichnen" : "Maßnahme zeichnen"}
			</Button>
			{isDrawing && liveMeasureInfo && geometryType === "Polygon" && (
				<div className="bg-background border-primary absolute right-0 bottom-full z-10 mb-2 w-64 border p-2 text-xs shadow-lg">
					<p className="font-semibold">Fläche: {liveMeasureInfo.area}</p>
					{visibleSegments.length > 0 && (
						<div className="text-muted-foreground mt-1 space-y-0.5">
							{visibleSegments.map((segment) => (
								<p key={segment}>{segment}</p>
							))}
							{hiddenSegmentsCount > 0 && (
								<p>+ {hiddenSegmentsCount} weitere Kanten</p>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default DrawMeasureButton;
