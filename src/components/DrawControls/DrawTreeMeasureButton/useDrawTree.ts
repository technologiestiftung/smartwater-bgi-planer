import { createEntityId } from "@/lib/helpers/common";
import { isSwaleLayerConfigId } from "@/lib/helpers/measures/swale";
import { getLayerById } from "@/lib/helpers/ol";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useProjectStore } from "@/store/project";
import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import Draw from "ol/interaction/Draw";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

export type TreeSize = "sm" | "md" | "lg";

const TREE_MEASURE_NAMES: Record<TreeSize, string> = {
	sm: "trees_sm",
	md: "trees_md",
	lg: "trees_lg",
};

const findBtfFeature = (coord: number[], features: Feature<Geometry>[]) =>
	features.find((f) => f.getGeometry()?.intersectsCoordinate(coord));

export const useDrawTree = () => {
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
	const { activeScenarioId, connectedAreas } = useScenarioStore(
		useShallow((s) => ({
			activeScenarioId: s.activeScenarioId,
			connectedAreas: s.activeScenarioId
				? (s.scenarios[s.activeScenarioId]?.connectedAreas ?? [])
				: [],
		})),
	);

	const isTreePit = isSwaleLayerConfigId(layerConfigId);
	const selectedConnectedArea = connectedAreas.find(
		(a) => a.id === selectedConnectedAreaId,
	);
	const canDraw = !isTreePit || Boolean(selectedConnectedArea);

	const [activeSize, setActiveSize] = useState<TreeSize | null>(null);
	const drawRef = useRef<Draw | null>(null);
	const activeSizeRef = useRef<TreeSize | null>(null);
	const hasDrawnOnCurrentCARef = useRef(false);

	// Keep ref in sync with state
	useEffect(() => {
		activeSizeRef.current = activeSize;
	}, [activeSize]);

	// Ensure layers are visible
	useEffect(() => {
		if (!map || !drawLayerId) return;
		setLayerVisibility(drawLayerId, true);
		setLayerVisibility(LAYER_IDS.PROJECT_BTF_PLANNING, true);
	}, [map, drawLayerId, setLayerVisibility]);

	const stopDraw = useCallback(() => {
		if (!map || !drawRef.current) return;
		map.removeInteraction(drawRef.current);
		drawRef.current = null;
	}, [map]);

	const consumeCurrentCA = useCallback(() => {
		if (
			isTreePit &&
			hasDrawnOnCurrentCARef.current &&
			selectedConnectedAreaId &&
			activeScenarioId
		) {
			useScenarioStore
				.getState()
				.markConnectedAreaUsed(
					activeScenarioId,
					selectedConnectedAreaId,
					"trees",
				);
			hasDrawnOnCurrentCARef.current = false;
		}
	}, [isTreePit, selectedConnectedAreaId, activeScenarioId]);

	// Cleanup on unmount or layer change
	useEffect(() => {
		if (!map || !drawLayerId) return;
		stopDraw();
		return () => {
			consumeCurrentCA();
			stopDraw();
			useUiStore.getState().setSelectedConnectedArea(null);
		};
	}, [map, drawLayerId]); // eslint-disable-line react-hooks/exhaustive-deps

	// Stop draw if external isDrawing becomes false
	useEffect(() => {
		if (!isDrawing) {
			stopDraw();
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setActiveSize(null);
		}
	}, [isDrawing, stopDraw]);

	const stopSession = useCallback(() => {
		consumeCurrentCA();
		stopDraw();
		setActiveSize(null);
		setIsDrawing(false);
		useUiStore.getState().setSelectedConnectedArea(null);
	}, [consumeCurrentCA, stopDraw, setIsDrawing]);

	const startDraw = (size: TreeSize) => {
		if (!map) return;

		// If same size clicked again → do nothing (already active)
		if (drawRef.current && activeSizeRef.current === size) {
			return;
		}

		if (!canDraw) {
			setUploadError(
				"Bitte zuerst eine angeschlossene Fläche für den optimierten Baumstandort auswählen.",
			);
			return;
		}

		// If different size → stop current, start new
		if (drawRef.current) {
			stopDraw();
		}

		resetDrawInteractions();
		setActiveSize(size);

		const layer = map
			.getAllLayers()
			.find((l) => l.get("id") === drawLayerId) as VectorLayer<VectorSource>;
		const source = layer?.getSource();
		if (!(source instanceof VectorSource)) {
			console.error("[DrawTreeMeasureButton] Layer or source not found");
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
			type: "Point",
			condition: ({ coordinate: coord }) => {
				const feature = findBtfFeature(coord, getPlanningFeatures());
				if (!feature) return false;

				if (isTreePit && selectedConnectedArea) {
					const featureCode = feature.get("code");
					if (featureCode !== selectedConnectedArea.code) return false;
				}

				const code = feature.get("code");
				if (code) {
					useProjectStore.setState({ activeAreaId: code });
				}
				return true;
			},
		});

		drawRef.current.on("drawend", ({ feature: drawnFeature }) => {
			if (!activeScenarioId) return;
			const currentSize = activeSizeRef.current;
			if (!currentSize) return;

			drawnFeature.set("treeSize", currentSize);

			const process = () => {
				const activeAreaId = useProjectStore.getState().activeAreaId;
				const measure = {
					id: createEntityId("measure"),
					createdAt: Date.now(),
					code: activeAreaId ?? null,
					name: TREE_MEASURE_NAMES[currentSize],
					area: 0,
					connectedArea: isTreePit
						? (selectedConnectedArea?.area ?? 0)
						: undefined,
					configId: layerConfigId ?? "3B2",
					drawLayerId: drawLayerId ?? null,
				};

				console.log("[DrawTree] addMeasure", measure);
				drawnFeature.set("measureId", measure.id);
				useScenarioStore.getState().addMeasure(activeScenarioId, measure);
				useUiStore.getState().addDraftMeasureId(measure.id);
				hasDrawnOnCurrentCARef.current = true;
			};

			if (source.getFeatures().includes(drawnFeature)) process();
			else
				setTimeout(() => {
					if (source.getFeatures().includes(drawnFeature)) process();
				}, 0);
		});

		map.addInteraction(drawRef.current);
		setIsDrawing(true);
	};

	return { isDrawing, activeSize, canDraw, isTreePit, startDraw, stopSession };
};
