import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createGetResult, createSetResult, createSetStatus } from "./actions";
import { ResultActions, ResultState } from "./types";

const initialState: ResultState = {
	resultsByScenarioId: {},
	statusByScenarioId: {},
	hasHydrated: false,
};

export const useResultStore = create<ResultState & ResultActions>()(
	devtools(
		immer(
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
		),
		{ name: "resultStore" },
	),
);
