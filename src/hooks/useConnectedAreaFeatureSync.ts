"use client";

import { useMapStore } from "@/store/map";
import { useScenarioStore } from "@/store/scenario";
import type { ConnectedArea, Measure } from "@/store/scenario/types";
import type Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import { useEffect } from "react";

const EMPTY_CAS: ConnectedArea[] = [];
const EMPTY_MEASURES: Measure[] = [];

const getBadges = (connectedAreas: ConnectedArea[], measures: Measure[]) => {
	const linkedCaIds = new Set(
		measures.map((m) => m.connectedAreaId).filter(Boolean),
	);
	const badges = new Map<string, string>();

	connectedAreas
		.filter((ca) => ca.usedByMeasureId || linkedCaIds.has(ca.id))
		.forEach((ca, index) => {
			const badge = String(index + 1);
			badges.set(ca.id, badge);
			if (ca.usedByMeasureId) badges.set(ca.usedByMeasureId, badge);
		});

	for (const measure of measures) {
		const badge = measure.connectedAreaId
			? badges.get(measure.connectedAreaId)
			: undefined;
		if (badge) badges.set(measure.id, badge);
	}

	return badges;
};

const syncFeature = (
	feature: Feature,
	usedIds: Set<string>,
	badges: Map<string, string>,
) => {
	const caId = feature.get("connectedAreaId") as string | undefined;
	const id = caId ?? (feature.get("measureId") as string | undefined);
	if (!id) return false;

	let changed = false;
	if (caId && feature.get("isUsed") !== usedIds.has(caId)) {
		feature.set("isUsed", usedIds.has(caId), /* silent= */ true);
		changed = true;
	}
	if (feature.get("badge") !== badges.get(id)) {
		feature.set("badge", badges.get(id), /* silent= */ true);
		changed = true;
	}
	return changed;
};

/**
 * Keeps `isUsed` on every connected-area OL feature in sync with the
 * scenario store's `usedByMeasureId` field. This lets the `connectedArea`
 * OL style conditionally render used vs. available CAs without a second layer.
 * Also sets `badge` on connected-area and measure features so the map shows
 * which connected area belongs to which measure.
 */
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

	useEffect(() => {
		if (!map) return;

		const usedIds = new Set(
			connectedAreas.filter((ca) => ca.usedByMeasureId).map((ca) => ca.id),
		);
		const badges = getBadges(connectedAreas, measures);

		for (const layer of map.getAllLayers()) {
			if (!(layer instanceof VectorLayer)) continue;
			const source = layer.getSource() as VectorSource | null;
			if (!source) continue;

			let changed = false;
			for (const feature of source.getFeatures()) {
				if (syncFeature(feature, usedIds, badges)) changed = true;
			}
			if (changed) source.changed();
		}
	}, [map, connectedAreas, measures]);
}
