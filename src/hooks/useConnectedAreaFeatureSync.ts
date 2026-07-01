"use client";

import { useMapStore } from "@/store/map";
import { useScenarioStore } from "@/store/scenario";
import { LAYER_IDS } from "@/types/shared";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import { useEffect } from "react";

/**
 * Keeps `isUsed` on every connected-area OL feature in sync with the
 * scenario store's `usedByMeasureId` field. This lets the `connectedArea`
 * OL style conditionally render used vs. available CAs without a second layer.
 */
export function useConnectedAreaFeatureSync() {
	const map = useMapStore((state) => state.map);
	const connectedAreas = useScenarioStore((state) => {
		const id = state.activeScenarioId;
		return id ? (state.scenarios[id]?.connectedAreas ?? []) : [];
	});

	useEffect(() => {
		if (!map) return;

		const layer = map
			.getAllLayers()
			.find((l) => l.get("id") === LAYER_IDS.CONNECTED_AREA_DRAW) as
			| VectorLayer<VectorSource>
			| undefined;
		const source = layer?.getSource();
		if (!source) return;

		const usedIds = new Set(
			connectedAreas.filter((ca) => ca.usedByMeasureId).map((ca) => ca.id),
		);

		let changed = false;
		for (const feature of source.getFeatures()) {
			const caId = feature.get("connectedAreaId") as string | undefined;
			if (!caId) continue;

			const isUsed = usedIds.has(caId);
			if (feature.get("isUsed") !== isUsed) {
				feature.set("isUsed", isUsed, /* silent= */ true);
				changed = true;
			}
		}

		if (changed) source.changed();
	}, [map, connectedAreas]);
}
