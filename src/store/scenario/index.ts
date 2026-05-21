import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
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
import { Scenario, ScenarioActions, ScenarioState } from "./types";

const DEFAULT_SCENARIO_ID = "default-scenario";
const DEFAULT_SCENARIO_NAME = "Default Scenario";

const createDefaultScenario = (): Scenario => ({
	id: DEFAULT_SCENARIO_ID,
	name: DEFAULT_SCENARIO_NAME,
	connectedAreas: [],
	measures: [],
});

const initialState: ScenarioState = {
	scenarios: {
		[DEFAULT_SCENARIO_ID]: createDefaultScenario(),
	},
	activeScenarioId: DEFAULT_SCENARIO_ID,
	activeConnectedAreaId: null,
	hasHydrated: false,
};

export const useScenarioStore = create<ScenarioState & ScenarioActions>()(
	devtools(
		immer(
			persist(
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
					setHasHydrated: (state) => set({ hasHydrated: state }),
				}),
				{
					name: "scenario-storage",
					onRehydrateStorage: () => (state) => {
						if (
							state &&
							(Object.keys(state.scenarios).length === 0 ||
								!state.activeScenarioId)
						) {
							state.createScenario(DEFAULT_SCENARIO_NAME);
						}
						state?.setHasHydrated(true);
					},
				},
			),
		),
		{ name: "scenarioStore" },
	),
);
