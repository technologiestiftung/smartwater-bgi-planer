import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import type Feature from "ol/Feature";
import type { Vector as VectorSource } from "ol/source";

// Measures deleted during planning stay in the scenario until "Bestätigen"
// (capacities skip them). Their map features are kept here, not in a store
// (OL features aren't serializable), so they can be restored on cancel.
const removedFeatures: { source: VectorSource; feature: Feature }[] = [];

// setActiveScenario re-runs the derived simulation (capacities).
const resyncCapacities = () => {
	const { activeScenarioId, setActiveScenario } = useScenarioStore.getState();
	if (activeScenarioId) setActiveScenario(activeScenarioId);
};

export const markMeasureForDeletion = (
	measureId: string,
	source?: VectorSource,
) => {
	const feature = source
		?.getFeatures()
		.find((f) => f.get("measureId") === measureId);
	if (source && feature) {
		source.removeFeature(feature);
		removedFeatures.push({ source, feature });
	}
	useUiStore.getState().addPendingDeleteMeasureId(measureId);
	resyncCapacities();
};

export const confirmPendingDeletes = () => {
	const { pendingDeleteMeasureIds, clearPendingDeleteMeasureIds } =
		useUiStore.getState();
	const { activeScenarioId, removeMeasure } = useScenarioStore.getState();
	if (activeScenarioId) {
		for (const measureId of pendingDeleteMeasureIds) {
			removeMeasure(activeScenarioId, measureId);
		}
	}
	clearPendingDeleteMeasureIds();
	removedFeatures.length = 0;
};

export const cancelPendingDeletes = () => {
	for (const { source, feature } of removedFeatures) source.addFeature(feature);
	removedFeatures.length = 0;
	useUiStore.getState().clearPendingDeleteMeasureIds();
	resyncCapacities();
};
