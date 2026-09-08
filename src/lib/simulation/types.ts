import type {
	MeasureValues,
	MeasureValuesWithCalcFields,
} from "@/types/measures";
import type Feature from "ol/Feature";
import type { Geometry } from "ol/geom";

// OpenLayers feature used by simulation modules.
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

// Preprocessed aggregate output for all selected features.
export type PreprocessedFeatures = {
	featuresSelected: number;
	totalArea: number;
	computedArea: ComputedArea;
	areaPotential: MeasureValues;
	features: PreprocessedFeature[];
};
