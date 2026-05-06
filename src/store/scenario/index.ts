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
import { ScenarioActions, ScenarioState } from "./types";

const initialState: ScenarioState = {
	scenarios: {},
	activeScenarioId: null,
	comparisonIds: [],
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
						state?.setHasHydrated(true);
					},
				},
			),
		),
		{ name: "scenarioStore" },
	),
);
