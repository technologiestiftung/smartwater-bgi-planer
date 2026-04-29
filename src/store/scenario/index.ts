import { create } from "zustand";
import {
	createAddConnectedArea,
	createAddMeasure,
	createCreateScenario,
	createRemoveConnectedArea,
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
		addConnectedArea: createAddConnectedArea(set),
		removeConnectedArea: createRemoveConnectedArea(set),
		setActiveScenario: createSetActiveScenario(set),
	}),
);
