import areaCalculations from "@/lib/simulation/calculations/areaCalculations";
import measureCalculations from "@/lib/simulation/calculations/measureCalculations";
import reportPayload from "@/lib/simulation/calculations/reportPayload";
import Constants from "@/lib/simulation/constants";
import type {
	AccumulatedAbimoStats,
	AreaType,
	Measure,
	MeasureStats,
	ReportPayload,
	ResultItem,
	ResultStats,
	SimulationRunOptions,
} from "@/lib/simulation/types";
import type { InputFeature } from "@/store/project/types";

const getOlFeatures = (inputFeatures: InputFeature[]) =>
	inputFeatures.map((inputFeature) => inputFeature.feature);

const preprocessInput = (
	inputFeatures: InputFeature[],
	newUnpvd = 0,
): AccumulatedAbimoStats =>
	areaCalculations.calculateAllStats(getOlFeatures(inputFeatures), newUnpvd);

const applyMeasures = (
	inputFeatures: InputFeature[],
	measures: Measure[],
): MeasureStats => {
	if (inputFeatures.length === 0 || measures.length === 0) {
		return Constants.EMPTY_MEASURE_STATS;
	}

	return measureCalculations.calculateAllMeasureStats(
		getOlFeatures(inputFeatures),
		measures,
	);
};

const computeResults = (data: ResultItem[]): ResultStats =>
	areaCalculations.calculateResultStats(data);

const buildReportPayload = (
	accumulatedAbimoStats: AccumulatedAbimoStats,
	areaTypesData: AreaType[],
	accumulatedMeasureStats: MeasureStats | null,
	resultAbimoStats: ResultStats,
	preComputedStats: ResultStats,
	options: SimulationRunOptions["reportOptions"] = {},
): ReportPayload =>
	reportPayload.getReportPayload(
		accumulatedAbimoStats,
		areaTypesData,
		accumulatedMeasureStats,
		resultAbimoStats,
		preComputedStats,
		options,
	);

// const createResultId = () =>
// 	`result-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const simulationEngine = {
	preprocessInput,
	applyMeasures,
	computeResults,
	buildReportPayload,
};
