import type Feature from "ol/Feature";
import type { Geometry } from "ol/geom";

// OpenLayers feature used by simulation modules.
export type OLFeature = Feature<Geometry>;

// Supported measure kinds.
export type MeasureType = "greenRoof" | "unpaved" | "swale";

// Geometry-independent size data for a measure.
export type MeasureDimension = {
	length: number;
	width: number;
	area: number;
	height?: number;
	depth?: number;
	volume?: number;
	connectedArea?: number;
};

// Raw area properties read from OL features.
export type AreaValues = {
	total_area: number;
	roof: number;
	green_roof: number;
	pvd: number;
	to_swale: number;
	[key: string]: number;
};

// Derived partial areas in m2 for one block part.
export type ComputedArea = {
	total: number;
	roof: number;
	pvd: number;
	pvd_1: number;
	pvd_2: number;
	pvd_3: number;
	pvd_4: number;
	pvd_na: number;
	sealed: number;
	unsealed: number;
	green_roof_ext: number;
	green_roof_int: number;
	to_inf_mulde: number;
	to_inf_rigole: number;
	to_inf_mulde_rigole: number;
	to_retention: number;
};

// Available m2 by measure for one block part.
export type AreaPotential = {
	green_roof_ext: number;
	green_roof_int: number;
	unpaving: number;
	permeable_paving: number;
	to_inf_mulde: number;
	to_inf_rigole: number;
	to_inf_mulde_rigole: number;
	to_retention: number;
};

// Preprocessed per-feature output.
export type PreprocessedFeature = {
	code: string;
	computedArea: ComputedArea;
	areaPotential: AreaPotential;
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
	areaPotential: AreaPotential;
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
