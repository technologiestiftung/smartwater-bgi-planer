"use client";

import { Button } from "@/components/ui/button";
import measuresConfig from "@/config/measuresConfig.json";
import {
	createMeasureConfigMap,
	normalizeMeasureGeometryType,
} from "@/lib/helpers/measures/config";
import { isSwaleLayerConfigId } from "@/lib/helpers/measures/swale";
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
import type Projection from "ol/proj/Projection";
import { Vector as VectorSource } from "ol/source.js";
import { getArea } from "ol/sphere.js";
import CircleStyle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";

type FeatureProjection = Projection | string;

type MeasureData = {
	id: string;
	values: Record<string, string | number | null>;
};

type PersistClippedFeatureParams = {
	clippedFeature: Feature<Geometry>;
	index: number;
	scenarioId: string;
	source: VectorSource;
	geojson: GeoJSON;
	projection: FeatureProjection;
};

interface LiveMeasureInfo {
	area: string;
	segmentLengths: string[];
}

const createEntityId = (prefix: string, index: number) =>
	`${prefix}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`;

const measureConfigById = createMeasureConfigMap(
	measuresConfig as MeasureConfig[],
);

const writeFeatureGeoJSON = (
	geojson: GeoJSON,
	feature: Feature<Geometry>,
	projection: FeatureProjection,
) =>
	geojson.writeFeatureObject(feature, {
		featureProjection: projection,
		dataProjection: "EPSG:4326",
	});

const buildPolygonLiveInfo = (geometry: Polygon): LiveMeasureInfo | null => {
	const ring = geometry.getCoordinates()[0] || [];
	if (ring.length < 2) return null;

	const segmentLengths = ring.slice(0, -1).map((_, i) => {
		const segment = new LineString([ring[i], ring[i + 1]]);
		return `Kante ${i + 1}: ${formatLength(segment)}`;
	});

	return {
		area: formatArea(geometry),
		segmentLengths,
	};
};

const createMeasure = (index: number): MeasureData => ({
	id: createEntityId("measure", index),
	values: {},
});

const stampMeasureProperties = (
	feature: Feature<Geometry>,
	measureData: MeasureData,
) => {
	feature.set("measureId", measureData.id);
	for (const [key, value] of Object.entries(measureData.values)) {
		if (value !== null && value !== undefined && value !== "") {
			feature.set(key, value);
		}
	}
};

const clipFeaturesToPlanningLayer = ({
	drawnFeature,
	planningFeatures,
	projection,
	isPoint,
}: {
	drawnFeature: Feature<Geometry>;
	planningFeatures: Feature<Geometry>[];
	projection: FeatureProjection;
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
	const measureGeoJSON = writeFeatureGeoJSON(geojson, drawnFeature, projection);

	const clipped: Feature<Geometry>[] = [];

	for (const planningFeature of planningFeatures) {
		const planningGeometry = planningFeature.getGeometry()!;
		if (!planningGeometry.intersectsExtent(geometry.getExtent())) continue;

		const planningGeoJSON = writeFeatureGeoJSON(
			geojson,
			planningFeature,
			projection,
		);
		if (!booleanIntersects(measureGeoJSON, planningGeoJSON)) continue;

		const intersectionInput = {
			type: "FeatureCollection",
			features: [measureGeoJSON, planningGeoJSON],
		} as Parameters<typeof intersect>[0];
		const intersection = intersect(intersectionInput);
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
export const DrawMeasureButton: FC = () => {
	// state
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);
	const isDrawing = useUiStore((state) => state.isDrawing);
	const setIsDrawing = useUiStore((state) => state.setIsDrawing);
	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);
	const setUploadError = useUiStore((state) => state.setUploadError);
	const openMeasureCard = useUiStore((state) => state.openMeasureCard);
	const selectedConnectedAreaId = useUiStore(
		(state) => state.selectedConnectedAreaId,
	);
	const addConnectedArea = useScenarioStore((state) => state.addConnectedArea);
	const connectedAreas = useScenarioStore((state) => {
		if (!state.activeScenarioId) return [];
		return state.scenarios[state.activeScenarioId]?.connectedAreas ?? [];
	});
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const isConnectedArea = layerConfigId === "connected_area";
	const isSwaleMeasure = isSwaleLayerConfigId(layerConfigId);
	const measureConfig = layerConfigId
		? measureConfigById.get(layerConfigId)
		: null;
	const selectedConnectedArea = connectedAreas.find(
		(area) => area.id === selectedConnectedAreaId,
	);
	const canDrawSelectedMeasure =
		!isSwaleMeasure || Boolean(selectedConnectedArea);
	const geometryType = normalizeMeasureGeometryType(
		measureConfig?.geometryType,
	);
	const [liveMeasureInfo, setLiveMeasureInfo] =
		useState<LiveMeasureInfo | null>(null);

	// refs
	const drawRef = useRef<Draw | null>(null);
	const sketchGeometryRef = useRef<Geometry | null>(null);
	const sketchChangeRef = useRef<(() => void) | null>(null);

	// functions
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

	const removeDrawInteraction = useCallback(() => {
		if (!map || !drawRef.current) return;
		clearLiveMeasure();
		map.removeInteraction(drawRef.current);
		drawRef.current = null;
	}, [map, clearLiveMeasure]);

	const persistClippedFeature = useCallback(
		({
			clippedFeature,
			index,
			scenarioId,
			source,
			geojson,
			projection,
		}: PersistClippedFeatureParams) => {
			if (isConnectedArea) {
				const geometry = clippedFeature.getGeometry();
				const area = geometry ? Number(getArea(geometry).toFixed(2)) : 0;
				const connectedArea = {
					id: createEntityId("connected-area", index),
					createdAt: Date.now(),
					feature: writeFeatureGeoJSON(geojson, clippedFeature, projection),
					area,
				};

				clippedFeature.set("connectedAreaId", connectedArea.id);
				source.addFeature(clippedFeature);
				addConnectedArea(scenarioId, connectedArea);
				return;
			}

			const measure = createMeasure(index);

			clippedFeature.set("measureLayerConfigId", layerConfigId ?? "");
			stampMeasureProperties(clippedFeature, measure);
			source.addFeature(clippedFeature);
			openMeasureCard(measure.id);
		},
		[addConnectedArea, isConnectedArea, layerConfigId, openMeasureCard],
	);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		setLayerVisibility(drawLayerId, true);
		setLayerVisibility(LAYER_IDS.PROJECT_BTF_PLANNING, true);
	}, [map, drawLayerId, setLayerVisibility]);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		removeSketchListener();

		if (drawRef.current) {
			map.removeInteraction(drawRef.current);
			drawRef.current = null;
		}

		return () => {
			removeSketchListener();
			if (drawRef.current) {
				map.removeInteraction(drawRef.current);
				drawRef.current = null;
			}
		};
	}, [map, drawLayerId, removeSketchListener]);

	useEffect(() => {
		if (!isDrawing) {
			removeSketchListener();
			if (drawRef.current && map) {
				map.removeInteraction(drawRef.current);
				drawRef.current = null;
			}
		}
	}, [isDrawing, map, removeSketchListener]);

	const toggleDraw = () => {
		if (!map) return;

		if (drawRef.current) {
			removeDrawInteraction();
			setIsDrawing(false);
			return;
		}

		if (!canDrawSelectedMeasure) {
			setUploadError(
				"Bitte zuerst eine angeschlossene Flaeche fuer die Versickerungsmassnahme auswaehlen.",
			);
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
					setLiveMeasureInfo(buildPolygonLiveInfo(geometry));
				};

				sketchChangeRef.current = update;
				geometry.on("change", update);
				update();
			});
		}

		drawRef.current.on("drawend", (event) => {
			clearLiveMeasure();

			const scenarioId = activeScenarioId;
			if (!scenarioId) return;
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
					persistClippedFeature({
						clippedFeature,
						index,
						scenarioId,
						source,
						geojson,
						projection,
					});
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
		if (isSwaleMeasure && !canDrawSelectedMeasure) {
			return "Erst angeschlossene Flaeche auswaehlen";
		}
		return "Maßnahme zeichnen";
	};

	return (
		<div className="relative">
			<Button
				variant="outline"
				onClick={toggleDraw}
				disabled={!isDrawing && !canDrawSelectedMeasure}
			>
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
