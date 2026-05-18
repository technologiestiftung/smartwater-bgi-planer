export type MeasureParameterConfig = {
	key: string;
	type: "number" | "integer" | "string";
	unit?: string;
	source: "drawn" | "input" | "derived";
	required?: boolean;
	isCalculationInput?: boolean;
	default?: number | string;
};

export type MeasureCalculationName =
	| "green_roof_ext"
	| "green_roof_int"
	| "unpaving"
	| "permeable_paving"
	| "to_inf_mulde"
	| "to_inf_rigole"
	| "to_inf_mulde_rigole"
	| "to_retention";

export type MeasureConfig = {
	id: string;
	measureKey?: MeasureCalculationName;
	geometryType?: "Polygon" | "Point" | "LineString" | "Circle";
	parameters: MeasureParameterConfig[];
};

export type MeasureGeometryType = "Point" | "LineString" | "Polygon" | "Circle";
