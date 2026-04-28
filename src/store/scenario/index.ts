import { create } from "zustand";
import {
	createAddMeasure,
	createCreateScenario,
	createRemoveMeasure,
	createSetActiveScenario,
	createUpdateMeasureValues,
	createUpdateScenarioName,
} from "./actions";
import { ScenarioActions, ScenarioState } from "./types";

const initialState: ScenarioState = {
	scenarios: {},
	activeScenarioId: null,
	comparisonIds: [],
};

export const useScenarioStore = create<ScenarioState & ScenarioActions>(
	(set) => ({
		...initialState,
		createScenario: createCreateScenario(set),
		updateScenarioName: createUpdateScenarioName(set),
		addMeasure: createAddMeasure(set),
		removeMeasure: createRemoveMeasure(set),
		updateMeasureValues: createUpdateMeasureValues(set),
		setActiveScenario: createSetActiveScenario(set),
	}),
);
