import { buildRabimoPayload } from "@/lib/helpers/buildRabimoPayload";
import { useProjectStore, useScenarioStore } from "@/store";
import { useMemo } from "react";

/**
 * Returns the current Rabimo payload derived from the active scenario's measures
 * and the project's input features. Recomputes whenever either changes.
 * Returns null when there is no active scenario or no input features loaded.
 */
export function useRabimoPayload() {
	const inputFeatures = useProjectStore((state) => state.inputFeatures);
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const scenarios = useScenarioStore((state) => state.scenarios);

	return useMemo(() => {
		if (!activeScenarioId || !scenarios[activeScenarioId]) return null;
		const measures = scenarios[activeScenarioId].measures;
		return buildRabimoPayload(inputFeatures, measures);
	}, [inputFeatures, activeScenarioId, scenarios]);
}
