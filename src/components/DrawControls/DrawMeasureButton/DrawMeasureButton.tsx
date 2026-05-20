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
import { simulationEngine } from "@/lib/simulation/simulationEngine";
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
import { FC, RefObject, useCallback, useEffect, useRef, useState } from "react";

// todo: update LiveMeasureInfo with new Potential after applyMeasure is called
interface LiveMeasureInfo {
	area: string;
	segmentLengths: string[];
	isOverPotential?: boolean;
}

const createEntityId = (prefix: string, index: number) =>
	`${prefix}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`;

const measureConfigById = createMeasureConfigMap(
	measuresConfig as MeasureConfig[],
);

const getMeasureArea = (values: Record<string, MeasureValue>): number => {
	if (typeof values.area === "number") {
		return values.area;
	}

	if (typeof values.connectedArea === "number") {
		return values.connectedArea;
	}

	return 0;
};

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

const shouldBlockClosingClick = ({
	map,
	sketchGeometry,
	pixel,
	isOverPotential,
}: {
	map: ReturnType<typeof useMapStore.getState>["map"];
	sketchGeometry: Geometry | null;
	pixel: number[];
	isOverPotential: boolean;
}): boolean => {
	if (!isOverPotential || !map || !(sketchGeometry instanceof Polygon)) {
		return false;
	}

	const ring = sketchGeometry.getCoordinates()[0] ?? [];
	const firstVertex = ring[0];
	if (!firstVertex) {
		return false;
	}

	const firstPixel = map.getPixelFromCoordinate(firstVertex);
	const dx = pixel[0] - firstPixel[0];
	const dy = pixel[1] - firstPixel[1];
	return Math.sqrt(dx * dx + dy * dy) <= 10;
};

const getActiveMeasurePotential = ({
	layerConfigId,
	measures,
	projectState,
}: {
	layerConfigId: string | null;
	measures: ReturnType<
		typeof useScenarioStore.getState
	>["scenarios"][string]["measures"];
	projectState: ReturnType<typeof useProjectStore.getState>;
}): number | null => {
	const config = measureConfigById.get(layerConfigId ?? "");
	const measureKey = config?.measureKey;
	if (!measureKey) {
		return null;
	}

	const activeAreaId = projectState.activeAreaId;
	const activeAreaIndex = projectState.inputFeatures.findIndex(
		(item) => item.properties.code === activeAreaId,
	);
	if (activeAreaIndex === -1) {
		return null;
	}

	const baseComputedArea = projectState.computedFeatures.find(
		(item) => item.code === activeAreaId,
	)?.computedArea;
	if (!baseComputedArea) {
		return null;
	}

	const measuresInActiveArea = measures.filter(
		(item) => item.code && item.code === activeAreaId,
	);
	const remainingPotential = simulationEngine.computeRemainingPotential(
		baseComputedArea,
		measuresInActiveArea,
	);

	return remainingPotential[measureKey];
};

// function returns boolean true if btf feature was found and
// updates store to set the activeAreaPotential and activeAreaId
const handleFirstBtfClick = (
	coord: number[],
	planningFeatures: Feature<Geometry>[],
	activeBtfFeatureRef: RefObject<Feature<Geometry> | null>,
): boolean => {
	const btfFeature = planningFeatures.find((f) =>
		f.getGeometry()?.intersectsCoordinate(coord),
	);
	if (!btfFeature) return false;

	activeBtfFeatureRef.current = btfFeature;

	const code = btfFeature.get("code") as string | undefined;
	if (code) {
		const { computedFeatures } = useProjectStore.getState();
		const computedFeature = computedFeatures.find((item) => item.code === code);
		useProjectStore.setState({
			activeAreaId: code,
			activeAreaPotential: computedFeature?.areaPotential ?? null,
		});
	}

	return true;
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

	// layer state
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);

	// UI state
	const isDrawing = useUiStore((state) => state.isDrawing);
	const setIsDrawing = useUiStore((state) => state.setIsDrawing);
	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);
	const setUploadError = useUiStore((state) => state.setUploadError);
	const selectedConnectedAreaId = useUiStore(
		(state) => state.selectedConnectedAreaId,
	);

	// scenario state
	const addConnectedArea = useScenarioStore((state) => state.addConnectedArea);
	const connectedAreas = useScenarioStore((state) => {
		if (!state.activeScenarioId) return [];
		return state.scenarios[state.activeScenarioId]?.connectedAreas ?? [];
	});
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const measures = useScenarioStore((state) => {
		if (!state.activeScenarioId) return [];
		return state.scenarios[state.activeScenarioId]?.measures ?? [];
	});

	// local state
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

	// todo: update liveMeasureInfo when applyMeasure is called
	const [liveMeasureInfo, setLiveMeasureInfo] =
		useState<LiveMeasureInfo | null>(null);

	// refs
	const drawRef = useRef<Draw | null>(null);
	const sketchGeometryRef = useRef<Geometry | null>(null);
	const sketchChangeRef = useRef<(() => void) | null>(null);
	const activeBtfFeatureRef = useRef<Feature<Geometry> | null>(null);
	const isOverPotentialRef = useRef(false);

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
		isOverPotentialRef.current = false;
		setLiveMeasureInfo(null);
	}, [removeSketchListener]);

	const removeDrawInteraction = useCallback(() => {
		if (!map || !drawRef.current) return;

		clearLiveMeasure();
		map.removeInteraction(drawRef.current);
		drawRef.current = null;
		activeBtfFeatureRef.current = null;
	}, [map, clearLiveMeasure]);

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

		// function that handles the first click on the BTF planning layer
		// it checks if activeBtfFeatureRef.current is set and calls handleFirstBtfClick
		// it returns a boolean, true if a BTF feature was found and false otherwise
		const btfDrawCondition: Condition = (mapBrowserEvent) => {
			const coord = mapBrowserEvent.coordinate;

			if (
				shouldBlockClosingClick({
					map,
					sketchGeometry: sketchGeometryRef.current,
					pixel: mapBrowserEvent.pixel,
					isOverPotential: isOverPotentialRef.current,
				})
			) {
				return false;
			}

			const planningLayer = getLayerById(
				map,
				LAYER_IDS.PROJECT_BTF_PLANNING,
			) as VectorLayer<VectorSource> | null;
			const planningFeatures = planningLayer?.getSource()?.getFeatures() ?? [];

			if (!activeBtfFeatureRef.current) {
				return handleFirstBtfClick(
					coord,
					planningFeatures,
					activeBtfFeatureRef,
				);
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
			style: getMeasureDrawStyles(geometryType),
			// condition to draw only on BTF feature
			condition: btfDrawCondition,
		});

		if (geometryType === "Polygon") {
			drawRef.current.on("drawstart", (event) => {
				const geometry = event.feature.getGeometry();
				if (!(geometry instanceof Polygon)) return;

				removeSketchListener();
				sketchGeometryRef.current = geometry;

				const update = () => {
					if (!(geometry instanceof Polygon)) {
						isOverPotentialRef.current = false;
						setLiveMeasureInfo(null);
						return;
					}

					const info = buildPolygonLiveInfo(geometry);
					if (!info) {
						isOverPotentialRef.current = false;
						setLiveMeasureInfo(null);
						return;
					}
					const projectState = useProjectStore.getState();
					const activePotential = getActiveMeasurePotential({
						layerConfigId,
						measures,
						projectState,
					});
					const currentArea = Number(getArea(geometry).toFixed(2));
					const isOverPotential =
						typeof activePotential === "number" &&
						currentArea > activePotential;

					isOverPotentialRef.current = isOverPotential;
					setLiveMeasureInfo({ ...info, isOverPotential });
				};

				sketchChangeRef.current = update;
				geometry.on("change", update);
				update();
			});
		}

		drawRef.current.on("drawend", (event) => {
			clearLiveMeasure();
			activeBtfFeatureRef.current = null;

			const scenarioId = activeScenarioId;
			if (!scenarioId) return;
			const drawnFeature = event.feature;

			const processMeasure = () => {
				const activeAreaId = useProjectStore.getState().activeAreaId;
				const config = measureConfigById.get(layerConfigId ?? "");
				if (!config) return;

				const values: Record<string, MeasureValue> = {};
				for (const param of config.parameters) {
					values[param.key] =
						param.source === "drawn"
							? (getDrawnValue(param, drawnFeature) as MeasureValue)
							: (param.default ?? "");
				}

				const measure = {
					id: createEntityId("measure", 0),
					createdAt: Date.now(),
					code: activeAreaId ?? null,
					name: config.measureKey ?? config.id,
					area: getMeasureArea(values),
					configId: layerConfigId ?? "",
					drawLayerId: drawLayerId ?? null,
				};

				drawnFeature.set("measureId", measure.id);

				Object.entries(values).forEach(([key, value]) => {
					if (value !== null && value !== undefined && value !== "") {
						drawnFeature.set(key, value);
					}
				});

				console.log("[DrawMeasureButton] measure::", measure);
				useScenarioStore.getState().addMeasure(scenarioId, measure);
			};

			const process = () => {
				if (isConnectedArea) {
					const geometry = drawnFeature.getGeometry();
					const area = geometry ? Number(getArea(geometry).toFixed(2)) : 0;
					const activeAreaId = useProjectStore.getState().activeAreaId;
					const connectedArea = {
						id: createEntityId("connected-area", 0),
						createdAt: Date.now(),
						code: activeAreaId ?? null,
						area,
					};
					drawnFeature.set("connectedAreaId", connectedArea.id);
					addConnectedArea(scenarioId, connectedArea);
				} else {
					processMeasure();
				}
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
					<p
						className={`font-semibold ${
							liveMeasureInfo.isOverPotential ? "text-destructive" : ""
						}`}
					>
						Fläche: {liveMeasureInfo.area}
					</p>
				</div>
			)}
		</div>
	);
};
