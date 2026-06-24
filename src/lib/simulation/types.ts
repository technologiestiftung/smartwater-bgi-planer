import { MeasureValues, MeasureValuesWithCalcFields } from "@/types/measures";
import type Feature from "ol/Feature";
import type { Geometry } from "ol/geom";

// OpenLayers feature used by simulation modules.
// todo: check if this is needed
export type OLFeature = Feature<Geometry>;

// Derived partial areas in m2 for one block part.
export interface ComputedArea extends MeasureValuesWithCalcFields {
	total: number;
	roof: number;
	pvd: number;
	pvd_1: number;
	pvd_2: number;
	pvd_3: number;
	pvd_4: number;
	pvd_na: number;
}

// Preprocessed per-feature output.
export type PreprocessedFeature = {
	code: string;
	computedArea: ComputedArea;
	areaPotential: MeasureValues;
};

// Payload-compatible per-feature state.
export type FeatureState = {
	code: string;
} & ComputedArea;

// Preprocessed aggregate output for all selected features.
export type PreprocessedFeatures = {
	featuresSelected: number;
	totalArea: number;
	computedArea: ComputedArea;
	areaPotential: MeasureValues;
	features: PreprocessedFeature[];
};

// Single simulation result row.
export type ResultItem = {
	area: number;
	delta_w: number;
	runoff: number;
	evapor: number;
	infiltr: number;
};

// Aggregated simulation output stats.
export type ResultStats = {
	deltaW: number;
	runoff: number;
	evaporation: number;
	infiltration: number;
};

// Final payload passed to report generation.
export type ReportPayload = {
	totalArea: number;
};

// Aggregated stats for selected measures.
export type MeasureStats = {
	// todo: add types
	// total_measure_area: number | null;
};
