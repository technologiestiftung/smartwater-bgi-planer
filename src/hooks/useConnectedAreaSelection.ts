"use client";

import { measureConfigById } from "@/config/measuresConfig";
import { useProjectStore } from "@/store/project";
import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import { useMemo } from "react";

const EMPTY_CONNECTED_AREAS: Array<{
	usedByMeasureId: string;
	id: string;
	area: number;
	code: string | null;
}> = [];

const EMPTY_MEASURES: Array<{
	area: number;
	code: string | null;
	configId: string;
	drawLayerId: string | null;
}> = [];

export function useConnectedAreaSelection(
	layerConfigId: string,
	drawLayerId: string,
) {
	const selectedConnectedAreaId = useUiStore(
		(state) => state.selectedConnectedAreaId,
	);

	const allConnectedAreas = useScenarioStore((state) =>
		state.activeScenarioId
			? (state.scenarios[state.activeScenarioId]?.connectedAreas ??
				EMPTY_CONNECTED_AREAS)
			: EMPTY_CONNECTED_AREAS,
	);

	const connectedAreas = useMemo(
		() => allConnectedAreas.filter((ca) => !ca.usedByMeasureId),
		[allConnectedAreas],
	);

	const measures = useScenarioStore((state) =>
		state.activeScenarioId
			? (state.scenarios[state.activeScenarioId]?.measures ?? EMPTY_MEASURES)
			: EMPTY_MEASURES,
	);

	const computedFeatures = useProjectStore((state) => state.computedFeatures);
	const measureKey = measureConfigById.get(layerConfigId)?.measureKey;

	const selectedConnectedArea = useMemo(
		() =>
			connectedAreas.find((area) => area.id === selectedConnectedAreaId) ??
			null,
		[connectedAreas, selectedConnectedAreaId],
	);

	const measureRows = useMemo(
		() =>
			measures.filter(
				(m) =>
					m.configId === layerConfigId ||
					m.configId === drawLayerId ||
					m.drawLayerId === drawLayerId,
			),
		[measures, layerConfigId, drawLayerId],
	);

	const summary = useMemo(() => {
		const selectedCode = selectedConnectedArea?.code ?? null;
		const selectedMeasureRows =
			selectedCode === null
				? measureRows
				: measureRows.filter((m) => m.code === selectedCode);
		const measureArea = selectedMeasureRows.reduce(
			(sum, m) => (typeof m.area === "number" ? sum + m.area : sum),
			0,
		);
		const potentialArea =
			measureKey && selectedCode
				? (computedFeatures.find((f) => f.code === selectedCode)?.areaPotential[
						measureKey
					] ?? 0)
				: 0;

		return {
			count: measureRows.length,
			measureArea,
			potentialArea,
			connectedArea: selectedConnectedArea?.area ?? 0,
		};
	}, [computedFeatures, measureKey, measureRows, selectedConnectedArea]);

	return {
		selectedConnectedAreaId,
		connectedAreas,
		selectedConnectedArea,
		measureRows,
		summary,
	};
}
