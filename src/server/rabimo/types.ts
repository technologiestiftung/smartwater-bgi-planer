import type { AreaProps } from "@/store/project/types";
import type { MeasureValuesWithTrees } from "@/types/measures";
// RabimoFeature is the API-facing shape of an input area — identical to AreaProps
// minus the OL-specific geometry field.
export type RabimoFeature = Omit<AreaProps, "geometry">;

export interface RabimoMeasure extends MeasureValuesWithTrees {
	code: string;
}

export interface RabimoPayload {
	blocks: RabimoFeature[];
	measures: RabimoMeasure[];
}

export function isValidRabimoPayload(value: unknown): value is RabimoPayload {
	return (
		typeof value === "object" &&
		value !== null &&
		Array.isArray((value as Record<string, unknown>).blocks) &&
		Array.isArray((value as Record<string, unknown>).measures)
	);
}
