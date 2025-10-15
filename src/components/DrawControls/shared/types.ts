// Shared types for all draw controls
export interface DrawControlProps {
	layerId: string;
	geometryType?: "Point" | "LineString" | "Polygon" | "Circle";
}

export type DrawInteractionState = "idle" | "drawing" | "active";

export interface MeasurementResult {
	area?: number;
	areaFormatted?: string;
	length?: number;
	lengthFormatted?: string;
}
