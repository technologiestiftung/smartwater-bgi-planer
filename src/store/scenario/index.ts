import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
	createAddConnectedArea,
	createAddMeasure,
	createCreateScenario,
	createMarkConnectedAreaUsed,
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
	hasHydrated: false,
};

export const useScenarioStore = create<ScenarioState & ScenarioActions>()(
	devtools(
		immer(
			persist(
				(set, get) => ({
					...initialState,
					createScenario: createCreateScenario(set),
					updateScenarioName: createUpdateScenarioName(set),
					addMeasure: createAddMeasure(set, get),
					removeMeasure: createRemoveMeasure(set, get),
					updateMeasureValues: createUpdateMeasureValues(set, get),
					addConnectedArea: createAddConnectedArea(set),
					removeConnectedArea: createRemoveConnectedArea(set),
					markConnectedAreaUsed: createMarkConnectedAreaUsed(set),
					setActiveScenario: createSetActiveScenario(set, get),
					setHasHydrated: (state) => set({ hasHydrated: state }),
					resetScenarioState: () => {
						set({
							...initialState,
							hasHydrated: true,
						});
					},
				}),
				{
					name: "scenario-storage",
					onRehydrateStorage: () => (state) => {
						if (state) {
							const scenarioIds = Object.keys(state.scenarios);
							const hasActiveScenario =
								!!state.activeScenarioId &&
								!!state.scenarios[state.activeScenarioId];

							if (scenarioIds.length === 0) {
								state.createScenario(DEFAULT_SCENARIO_NAME);
							} else if (!hasActiveScenario) {
								state.setActiveScenario(scenarioIds[0]);
							}
						}
						state?.setHasHydrated(true);
					},
				},
			),
		),
		{ name: "scenarioStore" },
	),
);
