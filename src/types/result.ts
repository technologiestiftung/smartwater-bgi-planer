export interface WaterBalanceEntry {
	runoff: number;
	infiltr: number;
	evapor: number;
	delta_w: number;
}

export interface WaterBalanceStatistics {
	status_quo: WaterBalanceEntry[];
	with_measures: WaterBalanceEntry[];
}

export interface WaterQualityEntry {
	overflow_volume: number[];
	critical_hours: number[];
	critical_events: number[];
}

export interface WaterQualityIndicators {
	status_quo: WaterQualityEntry;
	with_measures: WaterQualityEntry;
}

export interface ResultStatistics {
	water_balance: WaterBalanceStatistics;
	runoff_reduction_percent: number[];
	water_quality_indicators: WaterQualityIndicators;
}
