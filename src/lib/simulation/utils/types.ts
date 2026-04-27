import type Feature from "ol/Feature";
import type { Geometry } from "ol/geom";

// OpenLayers feature used by simulation utils.
export type OLFeature = Feature<Geometry>;

// Supported measure kinds.
export type MeasureType = "greenRoof" | "unpaved" | "swale";
// Supported measure sizes.
export type MeasureSize = "small" | "medium" | "large";

// Geometry-independent size data for a measure.
export type MeasureDimension = {
	length: number;
	width: number;
	area: number;
	height?: number;
	depth?: number;
	volume?: number;
	connectedArea?: number;
};

// User-selected measure input.
export type Measure = {
	type: MeasureType;
	size: MeasureSize;
	area?: number;
	volume?: number;
	connectedArea?: number;
};

// Raw area properties read from OL features (input features).
export type AreaValues = {
	total_area: number;
	roof: number;
	green_roof: number;
	pvd: number;
	to_swale: number;
	[key: string]: number;
};

// Aggregated area statistics.
export type AreaStats = {
	totalArea: number;
	featuresSelected: number;
	totalRoofArea: number;
	totalPavedArea: number;
	totalUnpavedArea: number;
	totalGreenRoofArea: number;
	totalSwaleConnectedArea: number;
	maxUnpavedArea: number;
	maxSwaleConnectedArea: number;
	totalSealedArea: number;
	meanRoof: number;
	meanUnpaved: number;
	meanGreenRoof: number;
	meanPaved: number;
	meanSwaleConnected: number;
	maxGreenRoof: number;
	maxUnpaved: number;
	maxSwaleConnected: number;
	maxGreenRoofToRoof: number;
	maxSwaleConnectedToPvd: number;
};

// Single simulation result row.
export type ResultItem = {
	area: number;
	delta_w: number;
	runoff: number;
	evapor: number;
	infiltr: number;
};

// Aggregated simulation output stats.
export type ResultStats = {
	deltaW: number;
	runoff: number;
	evaporation: number;
	infiltration: number;
};

// Configured area type entry.
export type AreaType = {
	id: string;
	max: number;
	name?: string;
};

// Area stats plus target values.
export type AccumulatedAbimoStats = AreaStats & {
	targetValueGreenRoof?: number;
	targetValueUnsealed?: number;
};

// Derived base values for report building.
export type BaseAreas = {
	totalArea: number;
	unpavedRatio: number;
	roofRatio: number;
	pavedRatio: number;
	targetGreenRoofPct: number;
	targetUnpavedPct: number;
	greenRoofToRoofRatio: number;
	roofArea: number;
	targetUnpavedArea: number;
	targetPavedArea: number;
};

// Final percentages shown for measure planning.
export type MeasurePlanningValues = {
	greenRoofPct: number;
	unpavedPct: number;
	swaleConnectedPct: number;
};

// Formatted area strings for status quo and simulation.
export type SurfaceAreaStrings = {
	statusQuo: Record<string, string>;
	simulation: Record<string, string>;
};

// Rounded water balance results.
export type WaterBalanceResult = {
	runoff: number;
	infiltration: number;
	evaporation: number;
	total: number;
	deltaW: number;
	runoffPct: number;
	infiltrationPct: number;
	evaporationPct: number;
};

// Rounded and formatted status quo water balance.
export type WaterBalanceStatusQuo = {
	runoff: number;
	infiltration: number;
	evaporation: number;
	total: number;
	deltaW: number;
	runoffFormatted: string;
	infiltrationFormatted: string;
	evaporationFormatted: string;
};

// Final payload passed to report generation.
export type ReportPayload = {
	totalArea: number;
	isMeasurePlanning: boolean;
	surfaceAreas: {
		roof: string;
		greenRoofStatusQuo: string;
		greenRoofSimulation: string;
		unpavedStatusQuo: string;
		unpavedSimulation: string;
		pavedStatusQuo: string;
		pavedSimulation: string;
	};
	measures: {
		selectedFeaturesCount: number;
		swaleConnectedPct: number;
		greenRoofPct: number;
		unpavedPct: number;
	};
	waterBalanceStatusQuo: {
		runoff: number;
		infiltration: number;
		evaporation: number;
		deltaW: number;
		runoffFormatted: string;
		infiltrationFormatted: string;
		evaporationFormatted: string;
	};
	abimoResult: {
		runoff: number;
		runoffPct: number;
		infiltration: number;
		infiltrationPct: number;
		evaporation: number;
		evaporationPct: number;
		deltaW: number;
	};
	cisternCalculatorLink: null;
};

// Aggregated stats for selected measures.
export type MeasureStats = {
	greenRoofMeasuresAmount: number;
	unpavedMeasuresAmount: number;
	swaleMeasuresAmount: number;

	totalGreenRoofArea: number;
	totalUnpavedArea: number;
	totalSwaleArea: number;
	totalSwaleVolume: number;
	totalSwaleConnectedArea: number;

	newGreenRoof: number | null;
	newGreenRoofToRoof: number | null;
	newUnpvd: number | null;
	newToSwale: number | null;

	pvd_neu: number | null;
	pvd_neu_area: number | null;
	newPvdToTotalArea: number | null;
	totalUnpavedToTotalArea: number | null;

	// Only populated when measures are provided
	Ag_0?: number;
	Ag_max?: number;
	Ag_neu?: number;
	Agt?: number;

	Ae_0?: number;
	Ae_max?: number;
	Ae_neu?: number;
	Aet?: number;

	Am_0?: number;
	Am_max?: number;
	Amt?: number;
};
