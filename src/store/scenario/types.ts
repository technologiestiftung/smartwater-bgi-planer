export type MeasureValue = number | string | null;

export interface Measure {
	id: string;
	createdAt: number;
	code: string | null;
	name: string;
	area: number;
	connectedArea?: number;
	configId: string;
	drawLayerId: string | null;
	// get rid off values?
	values?: Record<string, MeasureValue>;
}

export interface ConnectedArea {
	id: string;
	createdAt: number;
	code: string | null;
	area: number;
}

export interface Scenario {
	id: string;
	name: string;
	measures: Measure[];
	connectedAreas: ConnectedArea[];
}

export interface ScenarioState {
	scenarios: Record<string, Scenario>;
	activeScenarioId: string | null;
	hasHydrated: boolean;
}

export interface ScenarioActions {
	createScenario: (name: string) => void;
	updateScenarioName: (id: string, name: string) => void;
	addMeasure: (id: string, measure: Measure) => void;
	removeMeasure: (scenarioId: string, measureId: string) => void;
	updateMeasureValues: (
		scenarioId: string,
		measureId: string,
		values: Record<string, MeasureValue>,
	) => void;
	addConnectedArea: (scenarioId: string, connectedArea: ConnectedArea) => void;
	removeConnectedArea: (scenarioId: string, connectedAreaId: string) => void;
	setActiveScenario: (id: string) => void;
	setHasHydrated: (state: boolean) => void;
}
