import type {
	AccumulatedAbimoStats,
	AreaType,
	BaseAreas,
	MeasurePlanningValues,
	MeasureStats,
	ReportPayload,
	ResultStats,
	SurfaceAreaStrings,
	WaterBalanceResult,
	WaterBalanceStatusQuo,
} from "../types";

/**
 * Utility functions for calculations and formatting
 */
const utils = {
	mathRoundAndToFixed: (value: number, decimals = 0): number => {
		return Number(Math.round(value).toFixed(decimals));
	},

	mathRoundAndToFixedTwoAfterComma: (value: number): number => {
		return Number(value.toFixed(2));
	},

	fullPercentage: (ratio: number): number => {
		return utils.mathRoundAndToFixedTwoAfterComma(ratio * 100);
	},

	formatAreaWithPercentage: (area: number, percentage: number): string => {
		return `${utils.mathRoundAndToFixed(area)} m² (${utils.fullPercentage(percentage)} %)`;
	},

	formatPercentageWithArea: (percentage: number, area: number): string => {
		return `${utils.fullPercentage(percentage)} % (${utils.mathRoundAndToFixed(area)} m²)`;
	},

	formatWaterBalanceValue: (value: number, totalValue: number): string => {
		const percentage = utils.mathRoundAndToFixedTwoAfterComma(
			(100 / totalValue) * value,
		);
		return `${utils.mathRoundAndToFixed(value)} mm/a (${percentage} %)`;
	},
};

/**
 * Calculate basic area values from the data
 */
function calculateBaseAreas(
	accumulatedAbimoStats: AccumulatedAbimoStats,
	areaTypesData: AreaType[],
): BaseAreas {
	const totalArea = accumulatedAbimoStats.totalArea;

	// Get area type ratios
	const unpavedRatio =
		areaTypesData.find((type) => type.id === "unpvd")?.max || 0;
	const roofRatio = areaTypesData.find((type) => type.id === "roof")?.max || 0;
	const pavedRatio = areaTypesData.find((type) => type.id === "pvd")?.max || 0;

	// Target values
	const targetGreenRoofPct = accumulatedAbimoStats.targetValueGreenRoof || 0;
	const targetUnpavedPct = accumulatedAbimoStats.targetValueUnsealed || 0;
	const greenRoofToRoofRatio = accumulatedAbimoStats.maxGreenRoofToRoof || 0;

	return {
		totalArea,
		unpavedRatio,
		roofRatio,
		pavedRatio,
		targetGreenRoofPct,
		targetUnpavedPct,
		greenRoofToRoofRatio,

		// Calculated areas
		roofArea: utils.mathRoundAndToFixed(totalArea * roofRatio),
		targetUnpavedArea: utils.mathRoundAndToFixed(
			totalArea * (targetUnpavedPct / 100),
		),
		get targetPavedArea() {
			return utils.mathRoundAndToFixed(
				totalArea - this.targetUnpavedArea - this.roofArea,
			);
		},
	};
}

/**
 * Calculate measure planning values
 */
function calculateMeasurePlanningValues(
	isMeasurePlanning: boolean,
	allMeasuredStats: MeasureStats | null,
	baseAreas: BaseAreas,
): MeasurePlanningValues {
	if (!isMeasurePlanning || !allMeasuredStats) {
		return {
			greenRoofPct: baseAreas.targetGreenRoofPct,
			unpavedPct: baseAreas.targetUnpavedPct,
			swaleConnectedPct: 0, // accumulatedAbimoStats.targetValueSwaleConnected || 0
		};
	}

	return {
		greenRoofPct: utils.fullPercentage(allMeasuredStats.newGreenRoof || 0),
		unpavedPct: utils.fullPercentage(allMeasuredStats.newUnpvd || 0),
		swaleConnectedPct: utils.fullPercentage(allMeasuredStats.newToSwale || 0),
	};
}

/**
 * Calculate Abimo statistics
 */
function calculateAbimoValues(
	resultAbimoStats: ResultStats,
	preComputedStats: ResultStats,
): { result: WaterBalanceResult; statusQuo: WaterBalanceStatusQuo } {
	// Result stats (simulation)
	const resultRunoff = utils.mathRoundAndToFixed(resultAbimoStats.runoff);
	const resultInfiltration = utils.mathRoundAndToFixed(
		resultAbimoStats.infiltration,
	);
	const resultEvaporation = utils.mathRoundAndToFixed(
		resultAbimoStats.evaporation,
	);
	const resultTotal = resultRunoff + resultInfiltration + resultEvaporation;

	// Status quo stats
	const statusQuoRunoff = utils.mathRoundAndToFixed(preComputedStats.runoff);
	const statusQuoInfiltration = utils.mathRoundAndToFixed(
		preComputedStats.infiltration,
	);
	const statusQuoEvaporation = utils.mathRoundAndToFixed(
		preComputedStats.evaporation,
	);
	const statusQuoTotal =
		statusQuoRunoff + statusQuoInfiltration + statusQuoEvaporation;

	return {
		result: {
			runoff: resultRunoff,
			infiltration: resultInfiltration,
			evaporation: resultEvaporation,
			total: resultTotal,
			deltaW: utils.mathRoundAndToFixedTwoAfterComma(resultAbimoStats.deltaW),
			runoffPct: utils.mathRoundAndToFixedTwoAfterComma(
				(100 / resultTotal) * resultRunoff,
			),
			infiltrationPct: utils.mathRoundAndToFixedTwoAfterComma(
				(100 / resultTotal) * resultInfiltration,
			),
			evaporationPct: utils.mathRoundAndToFixedTwoAfterComma(
				(100 / resultTotal) * resultEvaporation,
			),
		},
		statusQuo: {
			runoff: statusQuoRunoff,
			infiltration: statusQuoInfiltration,
			evaporation: statusQuoEvaporation,
			total: statusQuoTotal,
			deltaW: utils.mathRoundAndToFixedTwoAfterComma(preComputedStats.deltaW),
			runoffFormatted: utils.formatWaterBalanceValue(
				statusQuoRunoff,
				statusQuoTotal,
			),
			infiltrationFormatted: utils.formatWaterBalanceValue(
				statusQuoInfiltration,
				statusQuoTotal,
			),
			evaporationFormatted: utils.formatWaterBalanceValue(
				statusQuoEvaporation,
				statusQuoTotal,
			),
		},
	};
}

/**
 * Format surface area data for the report
 */
function formatSurfaceAreas(
	baseAreas: BaseAreas,
	isMeasurePlanning: boolean,
	allMeasuredStats: MeasureStats | null,
): SurfaceAreaStrings {
	const {
		totalArea,
		roofArea,
		roofRatio,
		unpavedRatio,
		pavedRatio,
		greenRoofToRoofRatio,
	} = baseAreas;

	// Status quo values
	const statusQuo = {
		roof: utils.formatAreaWithPercentage(roofArea, roofRatio),
		greenRoof: utils.formatPercentageWithArea(
			greenRoofToRoofRatio,
			roofArea * greenRoofToRoofRatio,
		),
		unpaved: utils.formatAreaWithPercentage(
			totalArea * unpavedRatio,
			unpavedRatio,
		),
		paved: utils.formatAreaWithPercentage(totalArea * pavedRatio, pavedRatio),
	};

	// Simulation values
	let simulation;
	if (isMeasurePlanning && allMeasuredStats) {
		simulation = {
			greenRoof: utils.formatPercentageWithArea(
				utils.fullPercentage(allMeasuredStats.newGreenRoof || 0),
				utils.mathRoundAndToFixed(allMeasuredStats.Ag_neu || 0),
			),
			paved: utils.formatAreaWithPercentage(
				utils.mathRoundAndToFixed(allMeasuredStats.pvd_neu_area || 0),
				utils.mathRoundAndToFixedTwoAfterComma(
					allMeasuredStats.newPvdToTotalArea || 0,
				) / 100,
			),
			unpaved: utils.formatAreaWithPercentage(
				utils.mathRoundAndToFixed(allMeasuredStats.Ae_neu || 0),
				utils.mathRoundAndToFixedTwoAfterComma(
					allMeasuredStats.totalUnpavedToTotalArea || 0,
				) / 100,
			),
		};
	} else {
		simulation = {
			greenRoof: utils.formatPercentageWithArea(
				utils.fullPercentage(baseAreas.targetGreenRoofPct / 100 / roofRatio),
				utils.mathRoundAndToFixed(
					totalArea * (baseAreas.targetGreenRoofPct / 100),
				),
			),
			paved: utils.formatAreaWithPercentage(
				baseAreas.targetPavedArea,
				utils.fullPercentage(baseAreas.targetPavedArea / totalArea),
			),
			unpaved: utils.formatAreaWithPercentage(
				baseAreas.targetUnpavedArea,
				baseAreas.targetUnpavedPct / 100,
			),
		};
	}

	return { statusQuo, simulation };
}

/**
 * Main function to generate report payload
 *
 * @param {Object} accumulatedAbimoStats - Accumulated ABIMO statistics
 * @param {Array} areaTypesData - Area types data with id, name, and max values
 * @param {Object} accumulatedMeasureStats - Accumulated measure statistics
 * @param {Object} resultAbimoStats - ABIMO simulation results
 * @param {Object} preComputedStats - Pre-computed status quo statistics
 * @param {Object} options - Additional options
 * @param {boolean} options.isMeasurePlanning - Whether in measure planning mode
 * @param {Object} options.allMeasuredStats - All measured statistics (required if isMeasurePlanning is true)
 * @returns {Object} Formatted payload for report generation
 */
// eslint-disable-next-line max-params
function getReportPayload(
	accumulatedAbimoStats: AccumulatedAbimoStats,
	areaTypesData: AreaType[],
	accumulatedMeasureStats: MeasureStats | null,
	resultAbimoStats: ResultStats,
	preComputedStats: ResultStats,
	options: {
		isMeasurePlanning?: boolean;
		allMeasuredStats?: MeasureStats | null;
	} = {},
): ReportPayload {
	// Extract options
	const { isMeasurePlanning = false, allMeasuredStats = null } = options;

	// Calculate base values
	const baseAreas = calculateBaseAreas(accumulatedAbimoStats, areaTypesData);
	const measureValues = calculateMeasurePlanningValues(
		isMeasurePlanning,
		allMeasuredStats,
		baseAreas,
	);
	const waterBalance = calculateAbimoValues(resultAbimoStats, preComputedStats);
	const surfaceAreas = formatSurfaceAreas(
		baseAreas,
		isMeasurePlanning,
		allMeasuredStats,
	);

	const payload = {
		// Basic info
		totalArea: baseAreas.totalArea,
		isMeasurePlanning,

		// Surface area proportions - formatted strings ready for display
		surfaceAreas: {
			roof: surfaceAreas.statusQuo.roof,
			greenRoofStatusQuo: surfaceAreas.statusQuo.greenRoof,
			greenRoofSimulation: surfaceAreas.simulation.greenRoof,
			unpavedStatusQuo: surfaceAreas.statusQuo.unpaved,
			unpavedSimulation: surfaceAreas.simulation.unpaved,
			pavedStatusQuo: surfaceAreas.statusQuo.paved,
			pavedSimulation: surfaceAreas.simulation.paved,
		},

		// Applied measures
		measures: {
			selectedFeaturesCount: accumulatedAbimoStats.featuresSelected || 0,
			swaleConnectedPct: measureValues.swaleConnectedPct,
			greenRoofPct: measureValues.greenRoofPct,
			unpavedPct: measureValues.unpavedPct,
		},

		// Water balance - Status Quo
		waterBalanceStatusQuo: {
			runoff: waterBalance.statusQuo.runoff,
			infiltration: waterBalance.statusQuo.infiltration,
			evaporation: waterBalance.statusQuo.evaporation,
			deltaW: waterBalance.statusQuo.deltaW,
			// Formatted versions for display
			runoffFormatted: waterBalance.statusQuo.runoffFormatted,
			infiltrationFormatted: waterBalance.statusQuo.infiltrationFormatted,
			evaporationFormatted: waterBalance.statusQuo.evaporationFormatted,
		},

		// ABIMO simulation results
		abimoResult: {
			runoff: waterBalance.result.runoff,
			runoffPct: waterBalance.result.runoffPct,
			infiltration: waterBalance.result.infiltration,
			infiltrationPct: waterBalance.result.infiltrationPct,
			evaporation: waterBalance.result.evaporation,
			evaporationPct: waterBalance.result.evaporationPct,
			deltaW: waterBalance.result.deltaW,
		},

		// Additional
		cisternCalculatorLink: null,
	};

	return payload;
}

const reportPayload = {
	getReportPayload,
	// Export utilities for testing
	utils,
	calculateBaseAreas,
	calculateAbimoValues,
};

export default reportPayload;
