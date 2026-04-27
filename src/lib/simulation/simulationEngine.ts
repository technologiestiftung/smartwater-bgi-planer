import areaCalculations from "@/lib/simulation/utils/areaCalculations";
import type { InputFeature } from "@/store/project/types";

type SimulationResult = {
	id: string;
	scenarioId: string;
	timestamp: number;
	data: Record<string, unknown>;
};

const preprocessInput = (inputFeatures: InputFeature[]) => {
	const olFeatures = inputFeatures.map((f) => f.feature);
	return areaCalculations.calculateAllStats(olFeatures, 0);
};

const applyMeasures = <T>(input: T, _measures: any[]) => input;

const computeResults = (_data: unknown): Record<string, unknown> => ({});

const createResultId = () =>
	`result-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const simulationEngine = {
	preprocessInput,
	run(baseInput: unknown, measures: any[]): SimulationResult {
		const preprocessedInput = preprocessInput(baseInput as InputFeature[]);
		const adjustedInput = applyMeasures(preprocessedInput, measures);
		const data = computeResults(adjustedInput);

		return {
			id: createResultId(),
			scenarioId: "",
			timestamp: Date.now(),
			data,
		};
	},
};
