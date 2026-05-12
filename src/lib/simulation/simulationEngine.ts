import areaCalculations from "@/lib/simulation/calculations/areaCalculations";
import measureCalculations from "@/lib/simulation/calculations/measureCalculations";
import type {
	Measure,
	MeasureStats,
	ResultItem,
	ResultStats,
} from "@/lib/simulation/types";
import type { InputFeature } from "@/store/project/types";

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

const applyMeasures = (
	inputFeatures: InputFeature[],
	measures: Measure[],
): MeasureStats => {
	// function to calculate measure stats
	// updatePreComputedStats
	// accumulatedStats (currentState)? -> Update das bei jedem setzten einer Maßnahme passieren muss um zu bestimmen wie viel Fläche wir zur Verfügung haben
	// -> muss am Anfang aufgerufen werden um potentialfläche anzuzeigen (available) (jedes mal wenn eine BTF geklickt wird, muss die potentielle fläche für die maßnhame angezeigt werden)
	// 2. get_available_m2
	if (inputFeatures.length === 0 || measures.length === 0) {
		return {
			total_measure_area: null,
		};
	}

	return measureCalculations.calculateAllMeasureStats(
		getOlFeatures(inputFeatures),
		measures,
	);
};

const computeResults = (data: ResultItem[]): ResultStats =>
	areaCalculations.calculateResultStats(data);

export const simulationEngine = {
	preprocessInput,
	applyMeasures,
	computeResults,
};
