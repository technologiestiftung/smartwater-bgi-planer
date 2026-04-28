import type { MeasureConfig, MeasureGeometryType } from "@/types/measures";

export const createMeasureConfigMap = (configs: MeasureConfig[]) =>
	new Map(configs.map((config) => [config.id, config] as const));

export const normalizeMeasureGeometryType = (
	geometryType: string | undefined,
): MeasureGeometryType => {
	if (geometryType === "Point") return "Point";
	if (geometryType === "LineString") return "LineString";
	if (geometryType === "Circle") return "Circle";
	return "Polygon";
};
