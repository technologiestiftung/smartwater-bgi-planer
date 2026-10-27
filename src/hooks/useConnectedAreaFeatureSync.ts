"use client";

import { isConnectedAreaUsed } from "@/lib/helpers/measures/trees";
import { whenBadgeFontLoaded } from "@/lib/helpers/ol/style";
import { useMapStore } from "@/store/map";
import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import type { ConnectedArea, Measure } from "@/store/scenario/types";
import { LAYER_IDS } from "@/types/shared";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import { useEffect, useMemo, useState } from "react";

const EMPTY_CAS: ConnectedArea[] = [];
const EMPTY_MEASURES: Measure[] = [];

export function useConnectedAreaFeatureSync() {
	const map = useMapStore((state) => state.map);
	const connectedAreas = useScenarioStore((state) => {
		const id = state.activeScenarioId;
		return id ? (state.scenarios[id]?.connectedAreas ?? EMPTY_CAS) : EMPTY_CAS;
	});
	const measures = useScenarioStore((state) => {
		const id = state.activeScenarioId;
		return id
			? (state.scenarios[id]?.measures ?? EMPTY_MEASURES)
			: EMPTY_MEASURES;
	});

	const pendingDeleteMeasureIds = useUiStore(
		(state) => state.pendingDeleteMeasureIds,
	);

	const [badgeFontLoaded, setBadgeFontLoaded] = useState(false);

	useEffect(() => {
		whenBadgeFontLoaded().then(() => setBadgeFontLoaded(true));
	}, []);

	const usedIds = useMemo(
		() =>
			new Set(
				connectedAreas
					.filter((ca) =>
						isConnectedAreaUsed(ca, measures, pendingDeleteMeasureIds),
					)
					.map((ca) => ca.id),
			),
		[connectedAreas, measures, pendingDeleteMeasureIds],
	);

	useEffect(() => {
		if (!map) return;

		for (const layer of map.getAllLayers()) {
			if (!(layer instanceof VectorLayer)) continue;
			const source = layer.getSource() as VectorSource | null;
			const features = source?.getFeatures() ?? [];
			if (!features.some((f) => f.get("connectedAreaId") || f.get("measureId")))
				continue;

			if (layer.get("id") === LAYER_IDS.CONNECTED_AREA_DRAW) {
				for (const feature of features) {
					const caId = feature.get("connectedAreaId") as string | undefined;
					if (caId)
						feature.set("isUsed", usedIds.has(caId), /* silent= */ true);
				}
			}
			source?.changed();
		}
	}, [map, usedIds, measures, badgeFontLoaded]);
}
