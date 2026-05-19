import measuresConfig from "@/config/measuresConfig.json";
import { createMeasureConfigMap } from "@/lib/helpers/measures/config";
import areaCalculations from "@/lib/simulation/calculations/areaCalculations";
import measureCalculations from "@/lib/simulation/calculations/measureCalculations";
import type {
	AreaPotential,
	ComputedArea,
	Measure,
	MeasureStats,
} from "@/lib/simulation/types";
import type { InputFeature } from "@/store/project/types";
import type { PlacedMeasure } from "@/store/scenario/types";
import type { MeasureCalculationName, MeasureConfig } from "@/types/measures";

const measureConfigById = createMeasureConfigMap(
	measuresConfig as MeasureConfig[],
);

const getMeasureAmount = (measure: PlacedMeasure): number => {
	return Number.isFinite(measure.area) ? measure.area : 0;
};

const getMeasureName = (
	measure: PlacedMeasure,
): MeasureCalculationName | null => {
	return measureConfigById.get(measure.configId)?.measureKey ?? null;
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

	console.log("[simulationEngine] preprocessed::", preprocessed);

	return preprocessed;
};

const applyMeasure = (area: ComputedArea, measure: Measure): MeasureStats => {
	const result = measureCalculations.calculateApplyMeasure(area, measure);

	console.log("[simulationEngine] result::", result);
	return {
		total_measure_area: result.total_measure_area,
	};
};

const computeRemainingPotential = (
	baseComputedArea: ComputedArea,
	measures: PlacedMeasure[],
): AreaPotential => {
	const nextComputedArea = measures.reduce((currentArea, measure) => {
		const measureName = getMeasureName(measure);
		const amount = getMeasureAmount(measure);
		if (!measureName || amount <= 0) {
			return currentArea;
		}

		return areaCalculations.applyMeasureToComputedArea(
			currentArea,
			measureName,
			amount,
		);
	}, baseComputedArea);

	return areaCalculations.toAreaPotential(nextComputedArea);
};

export const simulationEngine = {
	preprocessInput,
	applyMeasure,
	computeRemainingPotential,
};
