import type { MeasureValue } from "@/store/scenario/types";
import type { MeasureConfig, MeasureParameterConfig } from "@/types/measures";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import { LineString, Polygon } from "ol/geom";

const roundGeometryValue = (value: number) => Number(value.toFixed(2));

export const getDrawnValue = (
	parameter: MeasureParameterConfig,
	feature: Feature<Geometry>,
): MeasureValue => {
	const geometry = feature.getGeometry();
	if (!geometry) {
		return parameter.default ?? null;
	}

	if (parameter.key === "count") {
		return 1;
	}

	const geometryType = geometry.getType();
	if (geometryType.includes("Polygon")) {
		return roundGeometryValue((geometry as Polygon).getArea());
	}

	if (geometryType.includes("LineString")) {
		return roundGeometryValue((geometry as LineString).getLength());
	}

	return parameter.default ?? null;
};

export const getInitialMeasureValues = (
	measureConfig: MeasureConfig,
	feature: Feature<Geometry>,
) =>
	measureConfig.parameters.reduce<Record<string, MeasureValue>>(
		(accumulator, parameter) => {
			accumulator[parameter.key] =
				parameter.source === "drawn"
					? getDrawnValue(parameter, feature)
					: (parameter.default ?? "");
			return accumulator;
		},
		{},
	);

export const formatMeasureValue = (value: MeasureValue) => {
	if (typeof value === "number") {
		return Number.isInteger(value) ? String(value) : value.toFixed(2);
	}

	return value ?? "";
};

export const parseMeasureValue = (
	rawValue: string,
	parameter: MeasureParameterConfig,
): MeasureValue => {
	if (parameter.type === "string") {
		return rawValue;
	}

	if (rawValue.trim() === "") {
		return null;
	}

	const parsedValue = Number(rawValue);
	if (Number.isNaN(parsedValue)) {
		return null;
	}

	return parameter.type === "integer" ? Math.trunc(parsedValue) : parsedValue;
};
