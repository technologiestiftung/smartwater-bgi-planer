/* eslint-disable no-nested-ternary */
"use client";

import { Button } from "@/components/ui/button";
import measuresConfig from "@/config/measuresConfig.json";
import {
	createMeasureConfigMap,
	normalizeMeasureGeometryType,
} from "@/lib/helpers/measures/config";
import { isSwaleLayerConfigId } from "@/lib/helpers/measures/swale";
import { getDrawnValue } from "@/lib/helpers/measures/values";
import { getLayerById, getSegmentLabelStyles } from "@/lib/helpers/ol";
import { formatArea, formatLength } from "@/lib/helpers/ol/format";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useProjectStore } from "@/store/project";
import { useScenarioStore } from "@/store/scenario";
import type { MeasureValue } from "@/store/scenario/types";
import { useUiStore } from "@/store/ui";
import type { MeasureConfig, MeasureGeometryType } from "@/types/measures";
import { LAYER_IDS } from "@/types/shared";
import { PolygonIcon } from "@phosphor-icons/react";
import type { Condition } from "ol/events/condition";
import type { FeatureLike } from "ol/Feature";
import Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import Draw from "ol/interaction/Draw";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import { getArea } from "ol/sphere";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { FC, useCallback, useEffect, useRef, useState } from "react";

interface LiveMeasureInfo {
	area: string;
	segmentLengths: string[];
	isOverPotential?: boolean;
}

const measureConfigById = createMeasureConfigMap(
	measuresConfig as MeasureConfig[],
);

const createEntityId = (prefix: string) =>
	`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getMeasureArea = (values: Record<string, MeasureValue>): number =>
	typeof values.area === "number"
		? values.area
		: typeof values.connectedArea === "number"
			? values.connectedArea
			: 0;

const defaultDrawStyle = new Style({
	fill: new Fill({ color: "rgba(0, 153, 255, 0.1)" }),
	stroke: new Stroke({ color: "rgba(0, 153, 255, 1)", width: 2 }),
	image: new CircleStyle({
		radius: 5,
		fill: new Fill({ color: "rgba(0, 153, 255, 1)" }),
		stroke: new Stroke({ color: "#fff", width: 1.5 }),
	}),
});

const getDrawStyle = (geometryType: MeasureGeometryType) =>
	geometryType !== "Polygon"
		? undefined
		: (feature: FeatureLike) => {
				const geometry =
					feature instanceof Feature ? feature.getGeometry() : null;
				return geometry instanceof Polygon
					? [defaultDrawStyle, ...getSegmentLabelStyles(geometry)]
					: [defaultDrawStyle];
			};

const buildPolygonLiveInfo = (geometry: Polygon): LiveMeasureInfo | null => {
	const ring = geometry.getCoordinates()[0] ?? [];
	if (ring.length < 2) return null;
	return {
		area: formatArea(geometry),
		segmentLengths: ring
			.slice(0, -1)
			.map(
				(_, i) =>
					`Kante ${i + 1}: ${formatLength(new LineString([ring[i], ring[i + 1]]))}`,
			),
	};
};

const findBtfFeature = (
	coord: number[],
	planningFeatures: Feature<Geometry>[],
): Feature<Geometry> | undefined =>
	planningFeatures.find((f) => f.getGeometry()?.intersectsCoordinate(coord));

export const DrawMeasureButton: FC = () => {
	const map = useMapStore((s) => s.map);
	const drawLayerId = useLayersStore((s) => s.drawLayerId);
	const layerConfigId = useLayersStore((s) => s.layerConfigId);
	const setLayerVisibility = useLayersStore((s) => s.setLayerVisibility);
	const isDrawing = useUiStore((s) => s.isDrawing);
	const setIsDrawing = useUiStore((s) => s.setIsDrawing);
	const resetDrawInteractions = useUiStore((s) => s.resetDrawInteractions);
	const setUploadError = useUiStore((s) => s.setUploadError);
	const selectedConnectedAreaId = useUiStore((s) => s.selectedConnectedAreaId);
	const addConnectedArea = useScenarioStore((s) => s.addConnectedArea);
	const activeScenarioId = useScenarioStore((s) => s.activeScenarioId);
	const connectedAreas = useScenarioStore((s) =>
		s.activeScenarioId
			? (s.scenarios[s.activeScenarioId]?.connectedAreas ?? [])
			: [],
	);

	const isConnectedArea = layerConfigId === "connected_area";
	const isSwaleMeasure = isSwaleLayerConfigId(layerConfigId);
	const measureConfig = layerConfigId
		? measureConfigById.get(layerConfigId)
		: null;
	const geometryType = normalizeMeasureGeometryType(
		measureConfig?.geometryType,
	);
	const canDraw =
		!isSwaleMeasure ||
		Boolean(connectedAreas.find((a) => a.id === selectedConnectedAreaId));
	const selectedConnectedArea = connectedAreas.find(
		(area) => area.id === selectedConnectedAreaId,
	);

	const [_liveMeasureInfo, setLiveMeasureInfo] =
		useState<LiveMeasureInfo | null>(null);
	const liveMeasureInfo = isDrawing ? _liveMeasureInfo : null;

	const drawRef = useRef<Draw | null>(null);
	const sketchGeometryRef = useRef<Geometry | null>(null);
	const sketchListenerRef = useRef<(() => void) | null>(null);
	const activeBtfFeatureRef = useRef<Feature<Geometry> | null>(null);
	const isOverPotentialRef = useRef(false);
	const activeMeasurePotentialRef = useRef<number | null>(null);

	const removeSketchListener = useCallback(() => {
		if (sketchGeometryRef.current && sketchListenerRef.current) {
			sketchGeometryRef.current.un("change", sketchListenerRef.current);
		}
		sketchGeometryRef.current = null;
		sketchListenerRef.current = null;
	}, []);

	const clearDrawCycleState = useCallback(() => {
		removeSketchListener();
		isOverPotentialRef.current = false;
		activeMeasurePotentialRef.current = null;
		activeBtfFeatureRef.current = null;
	}, [removeSketchListener]);

	const stopDraw = useCallback(() => {
		if (!map || !drawRef.current) return;
		clearDrawCycleState();
		map.removeInteraction(drawRef.current);
		drawRef.current = null;
	}, [clearDrawCycleState, map]);

	// show draw layers on mount
	useEffect(() => {
		if (!map || !drawLayerId) return;
		setLayerVisibility(drawLayerId, true);
		setLayerVisibility(LAYER_IDS.PROJECT_BTF_PLANNING, true);
	}, [map, drawLayerId, setLayerVisibility]);

	// sync interaction when layer changes or unmounts
	useEffect(() => {
		if (!map || !drawLayerId) return;
		stopDraw();
		return () => stopDraw();
	}, [map, drawLayerId]); // eslint-disable-line react-hooks/exhaustive-deps

	// sync when isDrawing is reset externally
	useEffect(() => {
		if (!isDrawing) stopDraw();
	}, [isDrawing, stopDraw]);

	const toggleDraw = () => {
		if (!map) return;

		if (drawRef.current) {
			stopDraw();
			setLiveMeasureInfo(null);
			setIsDrawing(false);
			return;
		}

		if (!canDraw) {
			setUploadError(
				"Bitte zuerst eine angeschlossene Flaeche fuer die Versickerungsmassnahme auswaehlen.",
			);
			return;
		}

		resetDrawInteractions();
		setLiveMeasureInfo(null);

		const layer = map
			.getAllLayers()
			.find((l) => l.get("id") === drawLayerId) as VectorLayer<VectorSource>;
		const source = layer?.getSource();

		if (!(source instanceof VectorSource)) {
			console.error("[DrawMeasureButton] Layer or source not found");
			return;
		}

		// get features from BTF planning
		const getPlanningFeatures = (): Feature<Geometry>[] =>
			(
				getLayerById(
					map,
					LAYER_IDS.PROJECT_BTF_PLANNING,
				) as VectorLayer<VectorSource> | null
			)
				?.getSource()
				?.getFeatures() ?? [];

		// draw condition
		const drawCondition: Condition = ({ coordinate: coord, pixel }) => {
			// block closing click when over potential
			if (
				isOverPotentialRef.current &&
				sketchGeometryRef.current instanceof Polygon
			) {
				const first = sketchGeometryRef.current.getCoordinates()[0]?.[0];
				if (first) {
					const fp = map.getPixelFromCoordinate(first);
					const dx = pixel[0] - fp[0],
						dy = pixel[1] - fp[1];
					if (Math.sqrt(dx * dx + dy * dy) <= 10) return false;
				}
			}

			if (!activeBtfFeatureRef.current) {
				const feature = findBtfFeature(coord, getPlanningFeatures());
				if (!feature) return false;
				activeBtfFeatureRef.current = feature;
				const code = feature.get("code");

				if (code) {
					const { computedFeatures } = useProjectStore.getState();
					const computedFeature = computedFeatures.find((f) => f.code === code);
					const measureKey = measureConfig?.measureKey;
					activeMeasurePotentialRef.current =
						measureKey && computedFeature
							? computedFeature.areaPotential[measureKey]
							: null;

					useProjectStore.setState({
						activeAreaId: code,
						activeAreaPotential: computedFeature?.areaPotential ?? null,
					});
				} else {
					activeMeasurePotentialRef.current = null;
				}
				return true;
			}

			return (
				activeBtfFeatureRef.current
					.getGeometry()
					?.intersectsCoordinate(coord) ?? false
			);
		};

		drawRef.current = new Draw({
			source,
			type: geometryType,
			style: getDrawStyle(geometryType),
			condition: drawCondition,
		});

		if (geometryType === "Polygon") {
			drawRef.current.on("drawstart", ({ feature }) => {
				const geometry = feature.getGeometry();
				if (!(geometry instanceof Polygon)) return;

				removeSketchListener();
				sketchGeometryRef.current = geometry;

				const update = () => {
					const info =
						geometry instanceof Polygon ? buildPolygonLiveInfo(geometry) : null;

					if (!info) {
						isOverPotentialRef.current = false;
						setLiveMeasureInfo(null);
						return;
					}

					const potential = activeMeasurePotentialRef.current;
					const currentArea = Number(getArea(geometry).toFixed(2));

					// check if over potential
					const isOverPotential =
						typeof potential === "number" && currentArea > potential;
					isOverPotentialRef.current = isOverPotential;

					console.log("[DrawMeasureButton] info::", info);

					setLiveMeasureInfo({ ...info, isOverPotential });
				};

				sketchListenerRef.current = update;
				geometry.on("change", update);
				update();
			});
		}

		drawRef.current.on("drawend", ({ feature: drawnFeature }) => {
			clearDrawCycleState();
			setLiveMeasureInfo(null);

			if (!activeScenarioId) return;

			const process = () => {
				const activeAreaId = useProjectStore.getState().activeAreaId;

				if (isConnectedArea) {
					const area = Number(getArea(drawnFeature.getGeometry()!).toFixed(2));
					const connectedArea = {
						id: createEntityId("connected-area"),
						createdAt: Date.now(),
						code: activeAreaId ?? null,
						area,
					};
					drawnFeature.set("connectedAreaId", connectedArea.id);
					addConnectedArea(activeScenarioId, connectedArea);
					return;
				}

				const config = measureConfigById.get(layerConfigId ?? "");
				if (!config) return;

				const values: Record<string, MeasureValue> = Object.fromEntries(
					config.parameters.map((p) => [
						p.key,
						p.source === "drawn"
							? (getDrawnValue(p, drawnFeature) as MeasureValue)
							: p.key === "connectedArea"
								? (selectedConnectedArea?.area ?? p.default ?? "")
								: (p.default ?? ""),
					]),
				);

				console.log("[DrawMeasureButton] values::", values);

				const measure = {
					id: createEntityId("measure"),
					createdAt: Date.now(),
					code: activeAreaId ?? null,
					name: config.measureKey ?? config.id,
					area: getMeasureArea(values),
					connectedArea:
						typeof values.connectedArea === "number"
							? values.connectedArea
							: undefined,
					configId: layerConfigId ?? "",
					drawLayerId: drawLayerId ?? null,
				};

				drawnFeature.set("measureId", measure.id);

				Object.entries(values).forEach(([k, v]) => {
					if (v !== null && v !== undefined && v !== "") drawnFeature.set(k, v);
				});

				console.log("[DrawMeasureButton] measure::", measure);
				useScenarioStore.getState().addMeasure(activeScenarioId, measure);
			};

			// OL sometimes fires drawend before the feature is in the source
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

	const label = isDrawing
		? "Stop Zeichnen"
		: isConnectedArea
			? "Angeschlossene Fläche zeichnen"
			: isSwaleMeasure && !canDraw
				? "Erst angeschlossene Flaeche auswaehlen"
				: "Maßnahme zeichnen";

	return (
		<div className="relative">
			<Button
				variant="outline"
				onClick={toggleDraw}
				disabled={!isDrawing && !canDraw}
			>
				<PolygonIcon />
				{label}
			</Button>
			{isDrawing && liveMeasureInfo && geometryType === "Polygon" && (
				<div className="bg-background border-primary text-primary absolute right-0 bottom-full z-10 mb-2 w-64 border-2 p-2 text-xs shadow-lg">
					<p
						className={`font-semibold ${liveMeasureInfo.isOverPotential ? "text-destructive" : ""}`}
					>
						Fläche: {liveMeasureInfo.area}
					</p>
				</div>
			)}
		</div>
	);
};
