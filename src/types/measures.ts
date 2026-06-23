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
