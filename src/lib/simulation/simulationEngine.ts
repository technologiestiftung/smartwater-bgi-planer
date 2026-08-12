import areaCalculations from "@/lib/simulation/calculations/areaCalculations";
import measureCalculations from "@/lib/simulation/calculations/measureCalculations";
import type { ComputedArea } from "@/lib/simulation/types";
import type { InputFeature } from "@/store/project/types";
import { Measure } from "@/store/scenario/types";
import type { MeasureValues } from "@/types/measures";

type ApplyMeasuresResult = {
	computedArea: ComputedArea;
	areaPotential: MeasureValues;
};

const getOlFeatures = (inputFeatures: InputFeature[]) =>
	inputFeatures.map((inputFeature) => inputFeature.feature);

// Preprocessing for all selected block parts (BTF):
// 1) Convert % input values to m2 per feature (toComputedArea)
// 2) Recalculate derived fields (sealed / unsealed / pvd split)
// 3) Calculate area potentials per feature (toAreaPotential)
// 4) Aggregate everything across all features
const preprocessInput = (inputFeatures: InputFeature[], _newUnpvd = 0) => {
	const features = getOlFeatures(inputFeatures);
	const preprocessed = areaCalculations.preprocessAllFeatures(features);

	return preprocessed;
};

const applyMeasures = (
	baseComputedArea: ComputedArea,
	measures: Measure[],
): ApplyMeasuresResult => {
	const computedArea = measures.reduce((currentArea, measure) => {
		return measureCalculations.calculateApplyMeasure(currentArea, measure);
	}, baseComputedArea);

	const areaPotential = areaCalculations.toAreaPotential(computedArea);

	// todo: I need to update the store with the new values!

	return {
		computedArea,
		areaPotential,
	};
};

export const simulationEngine = {
	preprocessInput,
	applyMeasures,
};
