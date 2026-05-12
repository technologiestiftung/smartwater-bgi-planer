import type { Measure, MeasureStats, OLFeature } from "../types";
import areaCalc from "./areaCalculations";

function calculateTotalMeasureArea(measures: Array<{ area?: number }>): number {
	return areaCalc.calculatePrecisely(
		measures.reduce((sum, measure) => sum + (measure.area || 0), 0),
	);
}

function calculateAllMeasureStats(
	selectedFeatures: OLFeature[],
	selectedMeasures: Measure[],
): MeasureStats {
	if (!selectedMeasures || selectedMeasures.length === 0) {
		return {
			total_measure_area: null,
		};
	}

	console.log("[measureCalculations] selectedFeatures::", selectedFeatures);
	console.log("[measureCalculations] selectedMeasures::", selectedMeasures);

	return {
		total_measure_area: calculateTotalMeasureArea(selectedMeasures),
	};
}

const measureCalculations = {
	calculateAllMeasureStats,
	calculateTotalMeasureArea,
};

export default measureCalculations;
