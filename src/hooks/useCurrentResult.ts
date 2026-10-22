import { useRabimoPayload } from "@/hooks/useRabimoPayload";
import { useResultStore, useScenarioStore } from "@/store";
import { useMemo } from "react";

/**
 * Returns the active scenario's stored Rabimo result, but only if it was
 * computed from the current payload. Stale results (measures changed since,
 * or the latest request failed) are hidden instead of shown as current.
 */
export function useCurrentResult() {
	const payload = useRabimoPayload();
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const result = useResultStore((state) =>
		activeScenarioId ? state.resultsByScenarioId[activeScenarioId] : undefined,
	);
	const payloadKey = useMemo(
		() => (payload ? JSON.stringify(payload) : null),
		[payload],
	);

	return result && result.payloadKey === payloadKey ? result : undefined;
}
