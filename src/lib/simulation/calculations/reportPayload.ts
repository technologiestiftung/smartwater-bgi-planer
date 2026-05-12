import type { ReportPayload, ResultStats } from "../types";

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

function getReportPayload(preComputedStats: ResultStats): ReportPayload {
	console.log("[reportPayload] preComputedStats::", preComputedStats);

	const payload: ReportPayload = {
		totalArea: 0,
	};

	return payload;
}

const reportPayload = {
	getReportPayload,
	// Export utilities for testing
	utils,
};

export default reportPayload;
