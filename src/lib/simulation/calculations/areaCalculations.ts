import type { MeasureCalculationName } from "@/types/measures";
import type {
	AreaPotential,
	AreaValues,
	ComputedArea,
	OLFeature,
	PreprocessedFeatures,
	ResultItem,
	ResultStats,
} from "../types";

type RabimoLikeAreaValues = AreaValues & {
	srf1_pvd: number;
	srf2_pvd: number;
	srf3_pvd: number;
	srf4_pvd: number;
	srf5_pvd: number;
};

function getValues(area: OLFeature): AreaValues {
	return (area as unknown as { values_: AreaValues }).values_;
}

function getRabimoLikeValues(area: OLFeature): RabimoLikeAreaValues {
	return getValues(area) as RabimoLikeAreaValues;
}

function getFeatureCode(area: OLFeature, index: number): string {
	const featureLike = area as any;
	const codeFromGet = featureLike.get?.("code");
	if (typeof codeFromGet === "string" && codeFromGet.length > 0) {
		return codeFromGet;
	}

	const codeFromValues = featureLike.values_?.code;
	if (typeof codeFromValues === "string" && codeFromValues.length > 0) {
		return codeFromValues;
	}

	return `feature_${index + 1}`;
}

function calculatePrecisely(value: number, precision = 9): number {
	const factor = Math.pow(10, precision);
	return Math.round(value * factor) / factor;
}

// R: update_calculated_fields
function updateCalculatedFields(areas: ComputedArea): ComputedArea {
	const pvd =
		areas.pvd_1 + areas.pvd_2 + areas.pvd_3 + areas.pvd_4 + areas.pvd_na;
	const sealed = pvd + areas.roof;

	return {
		...areas,
		pvd: calculatePrecisely(pvd),
		sealed: calculatePrecisely(sealed),
		unsealed: calculatePrecisely(areas.total - sealed),
	};
}

// R: rabimo_block_to_partial_areas_m2
function toComputedArea(area: OLFeature): ComputedArea {
	const values = getRabimoLikeValues(area);
	const total = Number(values.total_area);
	const roof = total * Number(values.roof);
	const pvd = total * Number(values.pvd);

	const current: ComputedArea = {
		total: calculatePrecisely(total),
		roof: calculatePrecisely(roof),
		pvd: 0,
		pvd_1: calculatePrecisely(Number(values.srf1_pvd) * pvd),
		pvd_2: calculatePrecisely(Number(values.srf2_pvd) * pvd),
		pvd_3: calculatePrecisely(Number(values.srf3_pvd) * pvd),
		pvd_4: calculatePrecisely(Number(values.srf4_pvd) * pvd),
		pvd_na: calculatePrecisely(Number(values.srf5_pvd) * pvd),
		sealed: 0,
		unsealed: 0,
		green_roof_ext: calculatePrecisely(roof * Number(values.green_roof)),
		green_roof_int: 0,
		to_inf_mulde: calculatePrecisely(Number(values.to_swale)),
		to_inf_rigole: 0,
		to_inf_mulde_rigole: 0,
		to_retention: 0,
	};

	return updateCalculatedFields(current);
}

// R: get_available_m2
function toAreaPotential(areas: ComputedArea): AreaPotential {
	const availableGreenRoof =
		areas.roof - areas.green_roof_ext - areas.green_roof_int;

	return {
		green_roof_ext: calculatePrecisely(availableGreenRoof),
		green_roof_int: calculatePrecisely(availableGreenRoof),
		unpaving: calculatePrecisely(areas.pvd),
		permeable_paving: calculatePrecisely(areas.pvd - areas.pvd_4),
		to_inf_mulde: calculatePrecisely(areas.sealed),
		to_inf_rigole: calculatePrecisely(areas.sealed),
		to_inf_mulde_rigole: calculatePrecisely(areas.sealed),
		to_retention: calculatePrecisely(areas.sealed),
	};
}

// R: is_no_op
function isNoOpMeasure(name: MeasureCalculationName | null): boolean {
	return (
		name === null ||
		name === "to_inf_mulde" ||
		name === "to_inf_rigole" ||
		name === "to_inf_mulde_rigole" ||
		name === "to_retention"
	);
}

// R: apply_measure
// Applies one measure to one BTF state and then refreshes derived fields.
function applyMeasureToComputedArea(
	areas: ComputedArea,
	measureName: MeasureCalculationName | null,
	measureArea: number,
): ComputedArea {
	const amount = calculatePrecisely(measureArea);

	if (measureName === "green_roof_ext" || measureName === "green_roof_int") {
		const nextGreenRoofExt =
			measureName === "green_roof_ext"
				? calculatePrecisely(areas.green_roof_ext + amount)
				: areas.green_roof_ext;
		const nextGreenRoofInt =
			measureName === "green_roof_int"
				? calculatePrecisely(areas.green_roof_int + amount)
				: areas.green_roof_int;

		return updateCalculatedFields({
			...areas,
			green_roof_ext: nextGreenRoofExt,
			green_roof_int: nextGreenRoofInt,
		});
	}

	if (measureName === "unpaving") {
		const newPvd = calculatePrecisely(areas.pvd - amount);
		const scalingFactor = areas.pvd === 0 ? 0 : newPvd / areas.pvd;

		return updateCalculatedFields({
			...areas,
			pvd_1: calculatePrecisely(areas.pvd_1 * scalingFactor),
			pvd_2: calculatePrecisely(areas.pvd_2 * scalingFactor),
			pvd_3: calculatePrecisely(areas.pvd_3 * scalingFactor),
			pvd_4: calculatePrecisely(areas.pvd_4 * scalingFactor),
			pvd_na: calculatePrecisely(areas.pvd_na * scalingFactor),
		});
	}

	if (isNoOpMeasure(measureName)) {
		return updateCalculatedFields(areas);
	}

	const pvdNot4 = areas.pvd_1 + areas.pvd_2 + areas.pvd_3 + areas.pvd_na;
	const scalingFactor = pvdNot4 === 0 ? 0 : 1 - (1 / pvdNot4) * amount;

	return updateCalculatedFields({
		...areas,
		pvd_4: calculatePrecisely(areas.pvd_4 + amount),
		pvd_1: calculatePrecisely(areas.pvd_1 * scalingFactor),
		pvd_2: calculatePrecisely(areas.pvd_2 * scalingFactor),
		pvd_3: calculatePrecisely(areas.pvd_3 * scalingFactor),
		pvd_na: calculatePrecisely(areas.pvd_na * scalingFactor),
	});
}

function createEmptyComputedArea(): ComputedArea {
	return {
		total: 0,
		roof: 0,
		pvd: 0,
		pvd_1: 0,
		pvd_2: 0,
		pvd_3: 0,
		pvd_4: 0,
		pvd_na: 0,
		sealed: 0,
		unsealed: 0,
		green_roof_ext: 0,
		green_roof_int: 0,
		to_inf_mulde: 0,
		to_inf_rigole: 0,
		to_inf_mulde_rigole: 0,
		to_retention: 0,
	};
}

function createEmptyAreaPotential(): AreaPotential {
	return {
		green_roof_ext: 0,
		green_roof_int: 0,
		unpaving: 0,
		permeable_paving: 0,
		to_inf_mulde: 0,
		to_inf_rigole: 0,
		to_inf_mulde_rigole: 0,
		to_retention: 0,
	};
}

function addComputedAreas(
	acc: ComputedArea,
	value: ComputedArea,
): ComputedArea {
	return {
		total: calculatePrecisely(acc.total + value.total),
		roof: calculatePrecisely(acc.roof + value.roof),
		pvd: calculatePrecisely(acc.pvd + value.pvd),
		pvd_1: calculatePrecisely(acc.pvd_1 + value.pvd_1),
		pvd_2: calculatePrecisely(acc.pvd_2 + value.pvd_2),
		pvd_3: calculatePrecisely(acc.pvd_3 + value.pvd_3),
		pvd_4: calculatePrecisely(acc.pvd_4 + value.pvd_4),
		pvd_na: calculatePrecisely(acc.pvd_na + value.pvd_na),
		sealed: calculatePrecisely(acc.sealed + value.sealed),
		unsealed: calculatePrecisely(acc.unsealed + value.unsealed),
		green_roof_ext: calculatePrecisely(
			acc.green_roof_ext + value.green_roof_ext,
		),
		green_roof_int: calculatePrecisely(
			acc.green_roof_int + value.green_roof_int,
		),
		to_inf_mulde: calculatePrecisely(acc.to_inf_mulde + value.to_inf_mulde),
		to_inf_rigole: calculatePrecisely(acc.to_inf_rigole + value.to_inf_rigole),
		to_inf_mulde_rigole: calculatePrecisely(
			acc.to_inf_mulde_rigole + value.to_inf_mulde_rigole,
		),
		to_retention: calculatePrecisely(acc.to_retention + value.to_retention),
	};
}

function addAreaPotentials(
	acc: AreaPotential,
	value: AreaPotential,
): AreaPotential {
	return {
		green_roof_ext: calculatePrecisely(
			acc.green_roof_ext + value.green_roof_ext,
		),
		green_roof_int: calculatePrecisely(
			acc.green_roof_int + value.green_roof_int,
		),
		unpaving: calculatePrecisely(acc.unpaving + value.unpaving),
		permeable_paving: calculatePrecisely(
			acc.permeable_paving + value.permeable_paving,
		),
		to_inf_mulde: calculatePrecisely(acc.to_inf_mulde + value.to_inf_mulde),
		to_inf_rigole: calculatePrecisely(acc.to_inf_rigole + value.to_inf_rigole),
		to_inf_mulde_rigole: calculatePrecisely(
			acc.to_inf_mulde_rigole + value.to_inf_mulde_rigole,
		),
		to_retention: calculatePrecisely(acc.to_retention + value.to_retention),
	};
}

// R: no single equivalent; iterates all selected blocks and combines
// rabimo_block_to_partial_areas_m2 + get_available_m2 per feature.
function preprocessAllFeatures(features: OLFeature[]): PreprocessedFeatures {
	const emptyComputedArea = createEmptyComputedArea();
	const emptyAreaPotential = createEmptyAreaPotential();

	if (!features || features.length === 0) {
		return {
			featuresSelected: 0,
			totalArea: 0,
			computedArea: emptyComputedArea,
			areaPotential: emptyAreaPotential,
			features: [],
		};
	}

	const perFeature = features.map((feature, index) => {
		const code = getFeatureCode(feature, index);
		const computedArea = toComputedArea(feature);
		const areaPotential = toAreaPotential(computedArea);

		return {
			code,
			computedArea,
			areaPotential,
		};
	});

	const computedArea = perFeature.reduce(
		(acc, item) => addComputedAreas(acc, item.computedArea),
		emptyComputedArea,
	);
	const areaPotential = perFeature.reduce(
		(acc, item) => addAreaPotentials(acc, item.areaPotential),
		emptyAreaPotential,
	);

	return {
		featuresSelected: features.length,
		totalArea: computedArea.total,
		computedArea,
		areaPotential,
		features: perFeature,
	};
}

function calculateResultStats(data: ResultItem[]): ResultStats {
	if (!data || data.length === 0) {
		return {
			deltaW: 0,
			runoff: 0,
			evaporation: 0,
			infiltration: 0,
		};
	}

	const totalArea = data.reduce((sum, item) => sum + item.area, 0);
	const getWeightedAverage = (fieldName: keyof ResultItem): number => {
		const weightedSum = data.reduce(
			(sum, item) => sum + item[fieldName] * item.area,
			0,
		);
		return totalArea ? weightedSum / totalArea : 0;
	};

	return {
		deltaW: getWeightedAverage("delta_w"),
		runoff: getWeightedAverage("runoff"),
		evaporation: getWeightedAverage("evapor"),
		infiltration: getWeightedAverage("infiltr"),
	};
}

const areaCalculations = {
	toComputedArea,
	updateCalculatedFields,
	toAreaPotential,
	applyMeasureToComputedArea,
	preprocessAllFeatures,
	calculateResultStats,
	calculatePrecisely,
};

export default areaCalculations;
