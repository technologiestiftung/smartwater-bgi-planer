import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createGetResult, createSetResult, createSetStatus } from "./actions";
import { ResultActions, ResultState } from "./types";

const initialState: ResultState = {
	resultsByScenarioId: {},
	statusByScenarioId: {},
	hasHydrated: false,
};

export const useResultStore = create<ResultState & ResultActions>()(
	persist(
		(set, get) => ({
			...initialState,
			setResult: createSetResult(set),
			setStatus: createSetStatus(set),
			getResult: createGetResult(get),
			setHasHydrated: (state) => set({ hasHydrated: state }),
		}),
		{
			name: "result-storage",
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);

// resultStore = {
//   results: [
//     {
//       code: "BTF1",
//       runoff: 123,
//       evaporation: 456,
//       infiltration: 789
//     }
//   ]
// }
