import type { Measure } from "@/store/scenario/types";

// Trees connected to the same area form one group; its connected area must only count once.
// Groups by connectedAreaId, falling back to code for trees saved without one.
export const countTreeGroupConnectedAreaOnce = (
	measures: Measure[],
): Measure[] => {
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
