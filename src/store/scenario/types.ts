export interface Scenario {
	id: string;
	name: string;
	measures: any[];
}

export interface ScenarioState {
	scenarios: Record<string, Scenario>;
	activeScenarioId: string | null;
	comparisonIds: string[];
}

export interface ScenarioActions {
	createScenario: (name: string) => void;
	updateScenarioName: (id: string, name: string) => void;
	addMeasure: (id: string, measure: any) => void;
	setActiveScenario: (id: string) => void;
}
