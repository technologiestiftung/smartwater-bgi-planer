import type { ComputedArea, Measure } from "../types";
import areaCalc from "./areaCalculations";

function calculateApplyMeasure(area: ComputedArea, measure: Measure) {
	console.log("[measureCalculations] area::", area);
	console.log("[measureCalculations] measure::", measure);

	console.log("[measureCalculations] areaCalc::", areaCalc);
	// areaCalc.addComputedAreas();

	return {
		total_measure_area: 0,
	};
}

const measureCalculations = {
	calculateApplyMeasure,
};

export default measureCalculations;
