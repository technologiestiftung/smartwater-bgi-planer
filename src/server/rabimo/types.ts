import type { AreaProps } from "@/store/project/types";
import { MeasureValuesWithTrees } from "@/types/measures";

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
