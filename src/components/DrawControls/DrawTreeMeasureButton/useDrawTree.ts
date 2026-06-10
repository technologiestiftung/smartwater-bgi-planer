import { createEntityId } from "@/lib/helpers/common";
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
	const { isDrawing, setIsDrawing, resetDrawInteractions } = useUiStore(
		useShallow((s) => ({
			isDrawing: s.isDrawing,
			setIsDrawing: s.setIsDrawing,
			resetDrawInteractions: s.resetDrawInteractions,
		})),
	);
	const activeScenarioId = useScenarioStore((s) => s.activeScenarioId);

	const [activeSize, setActiveSize] = useState<TreeSize | null>(null);
	const drawRef = useRef<Draw | null>(null);
	const activeSizeRef = useRef<TreeSize | null>(null);

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

	// Cleanup on unmount or layer change
	useEffect(() => {
		if (!map || !drawLayerId) return;
		stopDraw();
		return () => stopDraw();
	}, [map, drawLayerId]); // eslint-disable-line react-hooks/exhaustive-deps

	// Stop draw if external isDrawing becomes false
	useEffect(() => {
		if (!isDrawing) {
			stopDraw();
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setActiveSize(null);
		}
	}, [isDrawing, stopDraw]);

	const startDraw = (size: TreeSize) => {
		if (!map) return;

		// If same size clicked again → stop
		if (drawRef.current && activeSizeRef.current === size) {
			stopDraw();
			setActiveSize(null);
			setIsDrawing(false);
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
					configId: layerConfigId ?? "3B2",
					drawLayerId: drawLayerId ?? null,
				};

				drawnFeature.set("measureId", measure.id);
				useScenarioStore.getState().addMeasure(activeScenarioId, measure);
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

	return { isDrawing, activeSize, startDraw };
};
