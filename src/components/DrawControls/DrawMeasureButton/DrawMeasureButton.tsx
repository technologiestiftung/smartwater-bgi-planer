"use client";

import { Button } from "@/components/ui/button";
import measuresConfig from "@/config/measuresConfig.json";
import {
	createMeasureConfigMap,
	normalizeMeasureGeometryType,
} from "@/lib/helpers/measures/config";
import { getInitialMeasureValues } from "@/lib/helpers/measures/values";
import { getLayerById, getSegmentLabelStyles } from "@/lib/helpers/ol";
import { formatArea, formatLength } from "@/lib/helpers/ol/format";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import type { MeasureConfig, MeasureGeometryType } from "@/types/measures";
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
import { getArea } from "ol/sphere.js";
import CircleStyle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";

const measureConfigById = createMeasureConfigMap(
	measuresConfig as MeasureConfig[],
);

type LayerConfigItem = ReturnType<
	typeof useLayersStore.getState
>["layerConfig"][number];

// --- Measure payload ---

const createMeasurePayload = ({
	feature,
	index,
	geojson,
	projection,
	geometryType,
	drawLayerId,
	layerConfigId,
	layerConfig,
	measureConfig,
}: {
	feature: Feature<Geometry>;
	index: number;
	geojson: GeoJSON;
	projection: any;
	geometryType: MeasureGeometryType;
	drawLayerId: string | null;
	layerConfigId: string | null;
	layerConfig: LayerConfigItem | undefined;
	measureConfig: MeasureConfig | null;
}) => ({
	id: `measure-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
	createdAt: Date.now(),
	geometryType,
	drawLayerId,
	layerConfigId: layerConfigId ?? drawLayerId ?? `measure-${index}`,
	measureKey: measureConfig?.key ?? layerConfig?.name ?? "measure",
	title: layerConfig?.name ?? layerConfig?.question ?? "Maßnahme",
	feature: geojson.writeFeatureObject(feature, {
		featureProjection: projection,
		dataProjection: "EPSG:4326",
	}),
	values: measureConfig ? getInitialMeasureValues(measureConfig, feature) : {},
});

const stampMeasureProperties = (
	feature: Feature<Geometry>,
	payload: ReturnType<typeof createMeasurePayload>,
) => {
	feature.set("measureId", payload.id);
	feature.set("measureLayerConfigId", payload.layerConfigId);
	feature.set("measureKey", payload.measureKey);
	feature.set("measureTitle", payload.title);
	for (const [key, value] of Object.entries(payload.values)) {
		if (value !== null && value !== undefined && value !== "") {
			feature.set(key, value);
		}
	}
};

// --- BTF planning validation ---

const clipFeaturesToPlanningLayer = ({
	drawnFeature,
	planningFeatures,
	projection,
	isPoint,
}: {
	drawnFeature: Feature<Geometry>;
	planningFeatures: Feature<Geometry>[];
	projection: any;
	isPoint: boolean;
}): Feature<Geometry>[] => {
	const geometry = drawnFeature.getGeometry()!;

	if (isPoint) {
		const coord = (geometry as Point).getCoordinates();
		const isInside = planningFeatures.some((f) =>
			f.getGeometry()!.intersectsCoordinate(coord),
		);
		return isInside ? [drawnFeature] : [];
	}

	const geojson = new GeoJSON();
	const measureGeoJSON = geojson.writeFeatureObject(drawnFeature, {
		featureProjection: projection,
		dataProjection: "EPSG:4326",
	});

	const clipped: Feature<Geometry>[] = [];

	for (const planningFeature of planningFeatures) {
		const planningGeometry = planningFeature.getGeometry()!;
		if (!planningGeometry.intersectsExtent(geometry.getExtent())) continue;

		const planningGeoJSON = geojson.writeFeatureObject(planningFeature, {
			featureProjection: projection,
			dataProjection: "EPSG:4326",
		});
		if (!booleanIntersects(measureGeoJSON, planningGeoJSON)) continue;

		const intersection = intersect({
			type: "FeatureCollection",
			features: [measureGeoJSON, planningGeoJSON],
		} as any);
		if (!intersection) continue;

		clipped.push(
			...geojson.readFeatures(intersection, {
				dataProjection: "EPSG:4326",
				featureProjection: projection,
			}),
		);
	}

	return clipped;
};

// --- Scenario ---

const resolveScenarioId = (): string | null => {
	let id = useScenarioStore.getState().activeScenarioId;
	if (!id) {
		useScenarioStore.getState().createScenario("Default Scenario");
		id = useScenarioStore.getState().activeScenarioId;
	}
	return id;
};

// --- Draw styles ---

const defaultDrawStyle = new Style({
	fill: new Fill({ color: "rgba(0, 153, 255, 0.1)" }),
	stroke: new Stroke({ color: "rgba(0, 153, 255, 1)", width: 2 }),
	image: new CircleStyle({
		radius: 5,
		fill: new Fill({ color: "rgba(0, 153, 255, 1)" }),
		stroke: new Stroke({ color: "#fff", width: 1.5 }),
	}),
});

const getMeasureDrawStyles = (geometryType: MeasureGeometryType) => {
	if (geometryType !== "Polygon") return undefined;

	return (feature: FeatureLike) => {
		if (!(feature instanceof Feature)) return [defaultDrawStyle];
		const geometry = feature.getGeometry();
		if (!(geometry instanceof Polygon)) return [defaultDrawStyle];
		return [defaultDrawStyle, ...getSegmentLabelStyles(geometry)];
	};
};

// --- Component ---

interface LiveMeasureInfo {
	area: string;
	segmentLengths: string[];
}

export const DrawMeasureButton: FC = () => {
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
	const addConnectedArea = useScenarioStore((state) => state.addConnectedArea);
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const isConnectedArea = layerConfigId === "connected_area";
	const measureConfig = layerConfigId
		? measureConfigById.get(layerConfigId)
		: null;
	const geometryType = normalizeMeasureGeometryType(
		measureConfig?.geometryType,
	);
	const [liveMeasureInfo, setLiveMeasureInfo] =
		useState<LiveMeasureInfo | null>(null);

	const drawRef = useRef<Draw | null>(null);
	const sketchGeometryRef = useRef<Geometry | null>(null);
	const sketchChangeRef = useRef<(() => void) | null>(null);

	const removeSketchListener = useCallback(() => {
		if (sketchGeometryRef.current && sketchChangeRef.current) {
			sketchGeometryRef.current.un("change", sketchChangeRef.current);
		}
		sketchGeometryRef.current = null;
		sketchChangeRef.current = null;
	}, []);

	const clearLiveMeasure = useCallback(() => {
		removeSketchListener();
		setLiveMeasureInfo(null);
	}, [removeSketchListener]);

	useEffect(() => {
		if (!map || !drawLayerId) return;
		setLayerVisibility(drawLayerId, true);
		setLayerVisibility(LAYER_IDS.PROJECT_BTF_PLANNING, true);
	}, [map, drawLayerId, setLayerVisibility]);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		const cleanup = () => {
			clearLiveMeasure();
			if (drawRef.current) {
				map.removeInteraction(drawRef.current);
				drawRef.current = null;
			}
		};
		cleanup();
		return cleanup;
	}, [map, drawLayerId, clearLiveMeasure]);

	useEffect(() => {
		if (!isDrawing && drawRef.current && map) {
			removeSketchListener();
			map.removeInteraction(drawRef.current);
			drawRef.current = null;
		}
	}, [isDrawing, map, removeSketchListener]);

	useEffect(() => {
		if (!activeScenarioId) createScenario("Default Scenario");
	}, [activeScenarioId, createScenario]);

	const toggleDraw = () => {
		if (!map) return;

		if (drawRef.current) {
			clearLiveMeasure();
			map.removeInteraction(drawRef.current);
			drawRef.current = null;
			setIsDrawing(false);
			return;
		}

		resetDrawInteractions();

		const layer = map
			.getAllLayers()
			.find((l) => l.get("id") === drawLayerId) as VectorLayer<VectorSource>;
		const source = layer?.getSource();

		if (!source || !(source instanceof VectorSource)) {
			console.error("[DrawMeasureButton] Layer or source not found");
			return;
		}

		drawRef.current = new Draw({
			source,
			type: geometryType,
			style: getMeasureDrawStyles(geometryType),
		});

		if (geometryType === "Polygon") {
			drawRef.current.on("drawstart", (event) => {
				const geometry = event.feature.getGeometry();
				if (!(geometry instanceof Polygon)) return;

				removeSketchListener();
				sketchGeometryRef.current = geometry;

				const update = () => {
					if (!(geometry instanceof Polygon)) {
						setLiveMeasureInfo(null);
						return;
					}
					const ring = geometry.getCoordinates()[0] || [];
					if (ring.length < 2) {
						setLiveMeasureInfo(null);
						return;
					}
					const segments = ring.slice(0, -1).map((_, i) => {
						const segment = new LineString([ring[i], ring[i + 1]]);
						return `Kante ${i + 1}: ${formatLength(segment)}`;
					});
					setLiveMeasureInfo({
						area: formatArea(geometry),
						segmentLengths: segments,
					});
				};

				sketchChangeRef.current = update;
				geometry.on("change", update);
				update();
			});
		}

		drawRef.current.on("drawend", (event) => {
			clearLiveMeasure();

			const scenarioId = resolveScenarioId();
			if (!scenarioId) return;

			const currentLayerConfig = layerConfig.find(
				(c) => c.id === layerConfigId,
			);
			const drawnFeature = event.feature;

			const process = () => {
				const planningLayer = getLayerById(
					map,
					LAYER_IDS.PROJECT_BTF_PLANNING,
				) as VectorLayer<VectorSource> | null;
				const planningFeatures =
					planningLayer?.getSource()?.getFeatures() ?? [];

				if (planningFeatures.length === 0) {
					source.removeFeature(drawnFeature);
					console.warn(
						"[DrawMeasureButton] draw rejected: no BTF planning features",
					);
					return;
				}

				const projection = map.getView().getProjection();
				const clippedFeatures = clipFeaturesToPlanningLayer({
					drawnFeature,
					planningFeatures,
					projection,
					isPoint: geometryType === "Point",
				});

				source.removeFeature(drawnFeature);

				if (clippedFeatures.length === 0) {
					console.warn(
						"[DrawMeasureButton] draw rejected: outside BTF planning layer",
					);
					return;
				}

				const geojson = new GeoJSON();

				clippedFeatures.forEach((clippedFeature, index) => {
					if (isConnectedArea) {
						const geometry = clippedFeature.getGeometry();
						const area = geometry ? Number(getArea(geometry).toFixed(2)) : 0;
						const connectedAreaPayload = {
							id: `connected-area-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
							createdAt: Date.now(),
							feature: geojson.writeFeatureObject(clippedFeature, {
								featureProjection: projection,
								dataProjection: "EPSG:4326",
							}),
							area,
						};

						clippedFeature.set("connectedAreaId", connectedAreaPayload.id);
						source.addFeature(clippedFeature);
						addConnectedArea(scenarioId, connectedAreaPayload);
					} else {
						const payload = createMeasurePayload({
							feature: clippedFeature,
							index,
							geojson,
							projection,
							geometryType,
							drawLayerId: drawLayerId ?? null,
							layerConfigId: layerConfigId ?? null,
							layerConfig: currentLayerConfig,
							measureConfig: measureConfig ?? null,
						});

						stampMeasureProperties(clippedFeature, payload);
						source.addFeature(clippedFeature);
						addMeasure(scenarioId, payload);
						openMeasureCard(payload.id);
					}
				});
			};

			if (source.getFeatures().includes(drawnFeature)) {
				process();
			} else {
				setTimeout(() => {
					if (source.getFeatures().includes(drawnFeature)) process();
				}, 0);
			}
		});

		map.addInteraction(drawRef.current);
		setIsDrawing(true);
	};

	const getDrawButtonLabel = () => {
		if (isDrawing) return "Stop Zeichnen";
		if (isConnectedArea) return "Angeschlossene Fläche zeichnen";
		return "Maßnahme zeichnen";
	};

	return (
		<div className="relative">
			<Button variant="outline" onClick={toggleDraw}>
				<PolygonIcon />
				{getDrawButtonLabel()}
			</Button>
			{isDrawing && liveMeasureInfo && geometryType === "Polygon" && (
				<div className="bg-background border-primary text-primary absolute right-0 bottom-full z-10 mb-2 w-64 border-2 p-2 text-xs shadow-lg">
					<p className="font-semibold">Fläche: {liveMeasureInfo.area}</p>
				</div>
			)}
		</div>
	);
};
