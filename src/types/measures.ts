export type MeasureParameterConfig = {
	key: string;
	type: "number" | "integer" | "string";
	unit?: string;
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
	| "to_inf_mulde"
	| "to_inf_rigole"
	| "to_inf_mulde_rigole"
	| "to_retention"
	| "trees_sm"
	| "trees_md"
	| "trees_lg"
	| "to_surf_infil"
	| "to_tree_pit";

export type MeasureGeometryType = "Point" | "Polygon" | "Circle";

export type MeasureConfig = {
	id: string;
	measureKey?: MeasureKey;
	geometryType?: MeasureGeometryType;
	parameters: MeasureParameterConfig[];
};
