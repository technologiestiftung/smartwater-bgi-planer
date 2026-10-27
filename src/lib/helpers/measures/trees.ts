import type { ConnectedArea, Measure } from "@/store/scenario/types";

// Trees connected to the same area form one group; its connected area must only count once.
// Groups by connectedAreaId, falling back to code for trees saved without one.
export const countTreeGroupConnectedAreaOnce = <
	T extends Pick<
		Measure,
		"id" | "name" | "code" | "connectedArea" | "connectedAreaId"
	>,
>(
	measures: T[],
): T[] => {
	const countedGroups = new Set<string>();

	return measures.map((measure) => {
		if (!measure.name.startsWith("trees_") || !measure.connectedArea) {
			return measure;
		}

		const groupKey = measure.connectedAreaId ?? measure.code ?? measure.id;
		if (!countedGroups.has(groupKey)) {
			countedGroups.add(groupKey);
			return measure;
		}

		return { ...measure, connectedArea: 0 };
	});
};

// Trees saved without a connectedAreaId fall back to matching the code of a "trees" CA.
export const isTreeOfConnectedArea = (
	measure: Measure,
	connectedArea: ConnectedArea,
): boolean =>
	measure.name.startsWith("trees_") &&
	(measure.connectedAreaId
		? measure.connectedAreaId === connectedArea.id
		: connectedArea.usedByMeasureId === "trees" &&
			measure.code === connectedArea.code);

// A tree CA stays used while one of its trees isn't pending deletion.
export const isConnectedAreaUsed = (
	connectedArea: ConnectedArea,
	measures: Measure[],
	pendingDeleteMeasureIds: string[] = [],
): boolean =>
	connectedArea.usedByMeasureId === "trees"
		? measures.some(
				(m) =>
					!pendingDeleteMeasureIds.includes(m.id) &&
					isTreeOfConnectedArea(m, connectedArea),
			)
		: Boolean(connectedArea.usedByMeasureId);
