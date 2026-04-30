import type { Feature as GeoJSONFeature, Geometry } from "geojson";

export type ScenarioMeasureValue = number | string | null;

export interface ScenarioMeasure {
	id: string;
	createdAt: number;
	geometryType: "Point" | "LineString" | "Polygon" | "Circle";
	drawLayerId: string | null;
	layerConfigId: string;
	measureKey: string;
	title: string;
	feature: GeoJSONFeature<Geometry>;
	values: Record<string, ScenarioMeasureValue>;
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
	measures: ScenarioMeasure[];
	connectedAreas: ConnectedArea[];
	// it should save the BTFs here with the measurements
	BTFMeasures: BTFMeasureRow[];
}

type BTFMeasureRow = {
	// code: from BTF
	code: string;
	extensiveGreenRoof: number;
	intensiveGreenRoof: number;
	extensiveRetentionRoof: number;
	swale: number;
};

export interface ScenarioState {
	scenarios: Record<string, Scenario>;
	activeScenarioId: string | null;
	comparisonIds: string[];
	hasHydrated: boolean;
}

export interface ScenarioActions {
	createScenario: (name: string) => void;
	updateScenarioName: (id: string, name: string) => void;
	addMeasure: (id: string, measure: ScenarioMeasure) => void;
	removeMeasure: (scenarioId: string, measureId: string) => void;
	updateMeasureValues: (
		scenarioId: string,
		measureId: string,
		values: Record<string, ScenarioMeasureValue>,
	) => void;
	addConnectedArea: (scenarioId: string, connectedArea: ConnectedArea) => void;
	removeConnectedArea: (scenarioId: string, connectedAreaId: string) => void;
	setActiveScenario: (id: string) => void;
	setHasHydrated: (state: boolean) => void;
}
