import { Result, ResultState, ResultStatus } from "./types";

type SetState = (fn: (state: ResultState) => Partial<ResultState>) => void;
type GetState = () => ResultState;

export const createSetResult = (set: SetState) => {
	return (scenarioId: string, result: Result) => {
		set((state) => ({
			resultsByScenarioId: {
				...state.resultsByScenarioId,
				[scenarioId]: result,
			},
		}));
	};
};

export const createSetStatus = (set: SetState) => {
	return (scenarioId: string, status: ResultStatus) => {
		set((state) => ({
			statusByScenarioId: {
				...state.statusByScenarioId,
				[scenarioId]: status,
			},
		}));
	};
};

export const createGetResult = (get: GetState) => {
	return (scenarioId: string) => {
		return get().resultsByScenarioId[scenarioId];
	};
};
