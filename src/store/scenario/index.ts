import { create } from "zustand";
import {
	createAddMeasure,
	createCreateScenario,
	createSetActiveScenario,
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
		setActiveScenario: createSetActiveScenario(set),
	}),
);
