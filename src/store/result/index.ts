import { create } from "zustand";
import { createGetResult, createSetResult, createSetStatus } from "./actions";
import { ResultActions, ResultState } from "./types";

const initialState: ResultState = {
	resultsByScenarioId: {},
	statusByScenarioId: {},
};

export const useResultStore = create<ResultState & ResultActions>(
	(set, get) => ({
		...initialState,
		setResult: createSetResult(set),
		setStatus: createSetStatus(set),
		getResult: createGetResult(get),
	}),
);
