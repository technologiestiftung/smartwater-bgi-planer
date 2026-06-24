/* eslint-disable no-nested-ternary */
import { measureConfigById } from "@/config/measuresConfig";
import { createEntityId } from "@/lib/helpers/common";
import { isSwaleLayerConfigId } from "@/lib/helpers/measures/swale";
import { getDrawnValue } from "@/lib/helpers/measures/values";
import { getDrawStyle, getLayerById } from "@/lib/helpers/ol";
import { formatArea, formatLength } from "@/lib/helpers/ol/format";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useProjectStore } from "@/store/project";
import { useScenarioStore } from "@/store/scenario";
import type { MeasureValue } from "@/store/scenario/types";
import { useUiStore } from "@/store/ui";
import type { LiveMeasureInfo } from "@/types/measures";
import { LAYER_IDS } from "@/types/shared";
import intersect from "@turf/intersect";
import type {
	Feature as GeoJSONFeature,
	MultiPolygon as GeoJSONMultiPolygon,
	Polygon as GeoJSONPolygon,
} from "geojson";
import type { Condition } from "ol/events/condition";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import type Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import MultiPolygon from "ol/geom/MultiPolygon";
import Polygon from "ol/geom/Polygon";
import Draw from "ol/interaction/Draw";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import { getArea } from "ol/sphere";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

// --- Helpers ---

const getMeasureArea = (values: Record<string, MeasureValue>): number =>
	typeof values.area === "number"
		? values.area
		: typeof values.connectedArea === "number"
			? values.connectedArea
			: 0;

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

const findBtfFeature = (coord: number[], features: Feature<Geometry>[]) =>
	features.find((f) => f.getGeometry()?.intersectsCoordinate(coord));

const geoJsonFormat = new GeoJSON();

/**
 * Clips a drawn polygon to the boundary of the active BTF feature.
 * Returns the clipped OL Polygon, or null if there is no intersection.
 */
const clipToBtf = (
	drawnGeometry: Polygon,
	btfFeature: Feature<Geometry>,
): Polygon | null => {
	const btfGeometry = btfFeature.getGeometry();
	if (!btfGeometry) return drawnGeometry;
	if (
		!(btfGeometry instanceof Polygon) &&
		!(btfGeometry instanceof MultiPolygon)
	) {
		return drawnGeometry;
	}

	const drawnGeoJSON = geoJsonFormat.writeGeometryObject(
		drawnGeometry,
	) as GeoJSONPolygon;
	const btfGeoJSON = geoJsonFormat.writeGeometryObject(btfGeometry) as
		| GeoJSONPolygon
		| GeoJSONMultiPolygon;

	const drawnFeature: GeoJSONFeature<GeoJSONPolygon> = {
		type: "Feature",
		properties: {},
		geometry: drawnGeoJSON,
	};
	const btfFeatureGJ: GeoJSONFeature<GeoJSONPolygon | GeoJSONMultiPolygon> = {
		type: "Feature",
		properties: {},
		geometry: btfGeoJSON,
	};

	const clipped = intersect({
		type: "FeatureCollection",
		features: [drawnFeature, btfFeatureGJ],
	} as any);
	if (!clipped) return null;

	// intersect can return Polygon or MultiPolygon – take the largest polygon
	const clippedGeometry = geoJsonFormat.readGeometry(clipped.geometry);
	if (clippedGeometry instanceof Polygon) return clippedGeometry;
	if (clippedGeometry instanceof MultiPolygon) {
		const polygons = clippedGeometry.getPolygons();
		return polygons.reduce((largest, p) =>
			getArea(p) > getArea(largest) ? p : largest,
		);
	}
	return null;
};

// --- Hook ---

export const useDrawMeasure = () => {
	const map = useMapStore((s) => s.map);
	const { drawLayerId, layerConfigId, setLayerVisibility } = useLayersStore(
		useShallow((s) => ({
			drawLayerId: s.drawLayerId,
			layerConfigId: s.layerConfigId,
			setLayerVisibility: s.setLayerVisibility,
		})),
	);
	const {
		isDrawing,
		setIsDrawing,
		resetDrawInteractions,
		setUploadError,
		selectedConnectedAreaId,
	} = useUiStore(
		useShallow((s) => ({
			isDrawing: s.isDrawing,
			setIsDrawing: s.setIsDrawing,
			resetDrawInteractions: s.resetDrawInteractions,
			setUploadError: s.setUploadError,
			selectedConnectedAreaId: s.selectedConnectedAreaId,
		})),
	);
	const { addConnectedArea, activeScenarioId, connectedAreas } =
		useScenarioStore(
			useShallow((s) => ({
				addConnectedArea: s.addConnectedArea,
				activeScenarioId: s.activeScenarioId,
				connectedAreas: s.activeScenarioId
					? (s.scenarios[s.activeScenarioId]?.connectedAreas ?? [])
					: [],
			})),
		);

	const isConnectedArea = layerConfigId === LAYER_IDS.CONNECTED_AREA;
	const isSwaleMeasure = isSwaleLayerConfigId(layerConfigId);
	const measureConfig = layerConfigId
		? measureConfigById.get(layerConfigId)
		: null;
	const selectedConnectedArea = connectedAreas.find(
		(a) => a.id === selectedConnectedAreaId,
	);
	const canDraw = !isSwaleMeasure || Boolean(selectedConnectedArea);

	const [_liveMeasureInfo, setLiveMeasureInfo] =
		useState<LiveMeasureInfo | null>(null);
	const liveMeasureInfo = isDrawing ? _liveMeasureInfo : null;

	// Refs
	const drawRef = useRef<Draw | null>(null);
	const sketchGeometryRef = useRef<Geometry | null>(null);
	const sketchListenerRef = useRef<(() => void) | null>(null);
	const activeBtfFeatureRef = useRef<Feature<Geometry> | null>(null);
	const isOverPotentialRef = useRef(false);
	const activeMeasurePotentialRef = useRef<number | null>(null);

	// --- Lifecycle helpers ---

	const removeSketchListener = useCallback(() => {
		if (sketchGeometryRef.current && sketchListenerRef.current)
			sketchGeometryRef.current.un("change", sketchListenerRef.current);
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

	// --- Effects ---

	useEffect(() => {
		if (!map || !drawLayerId) return;
		setLayerVisibility(drawLayerId, true);
		setLayerVisibility(LAYER_IDS.PROJECT_BTF_PLANNING, true);
	}, [map, drawLayerId, setLayerVisibility]);

	useEffect(() => {
		if (!map || !drawLayerId) return;
		stopDraw();
		return () => stopDraw();
	}, [map, drawLayerId]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!isDrawing) stopDraw();
	}, [isDrawing, stopDraw]);

	// --- Draw condition ---

	const createDrawCondition = (
		getPlanningFeatures: () => Feature<Geometry>[],
	): Condition => {
		return ({ coordinate: coord, pixel }) => {
			if (
				isOverPotentialRef.current &&
				sketchGeometryRef.current instanceof Polygon
			) {
				const first = sketchGeometryRef.current.getCoordinates()[0]?.[0];
				if (first) {
					const fp = map!.getPixelFromCoordinate(first);
					const dx = pixel[0] - fp[0],
						dy = pixel[1] - fp[1];
					if (Math.sqrt(dx * dx + dy * dy) <= 10) return false;
				}
			}

			if (!activeBtfFeatureRef.current) {
				const feature = findBtfFeature(coord, getPlanningFeatures());
				if (!feature) return false;

				// For swale measures, only allow drawing in the BTF that contains the selected CA
				if (isSwaleMeasure && selectedConnectedArea) {
					const featureCode = feature.get("code");
					if (featureCode !== selectedConnectedArea.code) return false;
				}

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
	};

	// --- Draw start handler ---

	const handleDrawStart = (feature: Feature<Geometry>) => {
		const geometry = feature.getGeometry();
		if (!(geometry instanceof Polygon)) return;

		removeSketchListener();
		sketchGeometryRef.current = geometry;

		const update = () => {
			const info = buildPolygonLiveInfo(geometry);
			if (!info) {
				isOverPotentialRef.current = false;
				setLiveMeasureInfo(null);
				return;
			}
			const potential = activeMeasurePotentialRef.current;
			const currentArea = Number(getArea(geometry).toFixed(2));
			const isOverPotential =
				typeof potential === "number" && currentArea > potential;
			isOverPotentialRef.current = isOverPotential;
			setLiveMeasureInfo({ ...info, isOverPotential });
		};

		sketchListenerRef.current = update;
		geometry.on("change", update);
		update();
	};

	// --- Draw end handler ---

	const processDrawnFeature = (
		drawnFeature: Feature<Geometry>,
		source: VectorSource,
	) => {
		const btfFeature = activeBtfFeatureRef.current;
		clearDrawCycleState();
		setLiveMeasureInfo(null);
		if (!activeScenarioId) return;

		const process = () => {
			const activeAreaId = useProjectStore.getState().activeAreaId;

			// Clip drawn polygon to BTF boundary
			const drawnGeometry = drawnFeature.getGeometry();
			if (btfFeature && drawnGeometry instanceof Polygon) {
				const clipped = clipToBtf(drawnGeometry, btfFeature);

				if (!clipped) {
					source.removeFeature(drawnFeature);
					return;
				}
				drawnFeature.setGeometry(clipped);
			}

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
				useUiStore.getState().addDraftConnectedAreaId(connectedArea.id);
				return;
			}

			const config = measureConfigById.get(layerConfigId ?? "");
			if (!config) return;

			const values = Object.fromEntries(
				config.parameters.map((p) => [
					p.key,
					p.source === "drawn"
						? (getDrawnValue(p, drawnFeature) as MeasureValue)
						: p.key === "connectedArea"
							? (selectedConnectedArea?.area ?? p.default ?? "")
							: (p.default ?? ""),
				]),
			);

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

			console.log("[useDrawMeasure] measure::", measure);

			useScenarioStore.getState().addMeasure(activeScenarioId, measure);
			useUiStore.getState().addDraftMeasureId(measure.id);

			// Mark the connected area as used by this measure (polygon measures only)
			if (isSwaleMeasure && selectedConnectedAreaId) {
				useScenarioStore
					.getState()
					.markConnectedAreaUsed(
						activeScenarioId,
						selectedConnectedAreaId,
						measure.id,
					);
				useUiStore.getState().setSelectedConnectedArea(null);

				// Stop drawing – only one measure per connected area
				setTimeout(() => {
					stopDraw();
					setIsDrawing(false);
				}, 0);
			}
		};

		if (source.getFeatures().includes(drawnFeature)) process();
		else
			setTimeout(() => {
				if (source.getFeatures().includes(drawnFeature)) process();
			}, 0);
	};

	// --- Toggle draw ---

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
				"Bitte zuerst eine angeschlossene Fläche für die Versickerungsmassnahme auswählen.",
			);
			return;
		}

		resetDrawInteractions();
		setLiveMeasureInfo(null);

		// computedFeatures is not persisted — re-derive it from inputFeatures if
		// empty (e.g. after page reload) so the draw condition can resolve potentials.
		const projectState = useProjectStore.getState();
		if (
			projectState.computedFeatures.length === 0 &&
			projectState.inputFeatures.length > 0
		) {
			projectState.setInputFeatures(projectState.inputFeatures);
		}

		const layer = map
			.getAllLayers()
			.find((l) => l.get("id") === drawLayerId) as VectorLayer<VectorSource>;
		const source = layer?.getSource();
		if (!(source instanceof VectorSource)) {
			console.error("[DrawMeasureButton] Layer or source not found");
			return;
		}

		const getPlanningFeatures = (): Feature<Geometry>[] =>
			(
				getLayerById(
					map,
					LAYER_IDS.PROJECT_BTF_PLANNING,
				) as VectorLayer<VectorSource> | null
			)
				?.getSource()
				?.getFeatures() ?? [];

		drawRef.current = new Draw({
			source,
			type: "Polygon",
			style: getDrawStyle("Polygon"),
			condition: createDrawCondition(getPlanningFeatures),
		});

		drawRef.current.on("drawstart", ({ feature }) => handleDrawStart(feature));
		drawRef.current.on("drawend", ({ feature }) =>
			processDrawnFeature(feature, source),
		);

		map.addInteraction(drawRef.current);
		setIsDrawing(true);
	};

	// --- Label ---

	const label = isDrawing
		? "Stop Zeichnen"
		: isConnectedArea
			? "Angeschlossene Fläche zeichnen"
			: isSwaleMeasure && !canDraw
				? "Erst angeschlossene Fläche auswählen"
				: "Maßnahme zeichnen";

	return { isDrawing, canDraw, liveMeasureInfo, label, toggleDraw };
};
