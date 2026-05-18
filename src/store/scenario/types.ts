import type { Feature as GeoJSONFeature, Geometry } from "geojson";

export type MeasureValue = number | string | null;

export interface PlacedMeasure {
	id: string;
	createdAt: number;
	areaCode: string | null;
	configId: string;
	drawLayerId: string | null;
	values: Record<string, MeasureValue>;
}

export interface ConnectedArea {
	id: string;
	createdAt: number;
	feature: GeoJSONFeature<Geometry>;
	area: number;
}

export interface Scenario {
	id: string;
	name: string;
	measures: PlacedMeasure[];
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
	addMeasure: (id: string, measure: PlacedMeasure) => void;
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
