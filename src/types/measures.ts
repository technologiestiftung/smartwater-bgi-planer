export type MeasureParameterKey = "area" | "connectedArea" | "count";

export type MeasureParameterConfig = {
	type: "number" | "integer" | "string";
	unit?: string;
	key: string;
	source: "drawn" | "input" | "derived";
	required?: boolean;
	isCalculationInput?: boolean;
	default?: number | string;
};

export type MeasureKey =
	| "green_roof_ext"
	| "green_roof_int"
	| "unpaving"
	| "permeable_paving"
	| "to_swale"
	| "to_swale_trench"
	| "to_trench"
	| "to_cistern"
	| "to_surf_infil"
	| "to_tree_pit";

export type MeasureGeometryType = "Point" | "Polygon" | "Circle";

export type MeasureConfig = {
	id: string;
	measureKey?: MeasureKey;
	geometryType?: MeasureGeometryType;
	parameters: MeasureParameterConfig[];
};

export interface LiveMeasureInfo {
	area: string;
	segmentLengths: string[];
	isOverPotential?: boolean;
}

export interface MeasureValues {
	green_roof_ext: number;
	green_roof_int: number;
	to_swale: number;
	to_swale_trench: number;
	to_trench: number;
	to_cistern: number;
	to_surf_infil: number;
	to_tree_pit: number;
	unpaving: number;
	permeable_paving: number;
}

export interface MeasureValuesWithCalcFields extends MeasureValues {
	pvd: number;
	sealed: number;
	unsealed: number;
}

export interface MeasureValuesWithTrees extends MeasureValues {
	trees_sm: number;
	trees_md: number;
	trees_lg: number;
}
