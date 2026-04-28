export type MeasureParameterConfig = {
	key: string;
	type: "number" | "integer" | "string";
	unit?: string;
	role?: string;
	source: "drawn" | "input";
	required?: boolean;
	requiredFor?: string[];
	default?: number | string;
};

export type MeasureConfig = {
	id: string;
	key: string;
	geometryType?: "Polygon" | "Point" | "LineString" | "Circle";
	parameters: MeasureParameterConfig[];
};

export type MeasureGeometryType = "Point" | "LineString" | "Polygon" | "Circle";
