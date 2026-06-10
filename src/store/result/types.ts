export interface Result {
	id: string;
	scenarioId: string;
	timestamp: number;
	data: Record<string, unknown>;
}

export type ResultStatus = "idle" | "loading" | "done" | "error";

export interface ResultState {
	resultsByScenarioId: Record<string, Result>;
	statusByScenarioId: Record<string, ResultStatus>;
	hasHydrated: boolean;
}

export interface ResultActions {
	setResult: (scenarioId: string, result: Result) => void;
	setStatus: (scenarioId: string, status: ResultStatus) => void;
	getResult: (scenarioId: string) => Result | undefined;
	setHasHydrated: (state: boolean) => void;
	resetResultState: () => void;
}
