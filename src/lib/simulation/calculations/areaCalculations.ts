import { AreaProps } from "@/store/project/types";
import { MeasureValues } from "@/types/measures";
import type { ComputedArea, OLFeature, PreprocessedFeatures } from "../types";

// todo: do we actually need this
type RabimoLikeAreaValues = AreaProps & {
	srf1_pvd: number;
	srf2_pvd: number;
	srf3_pvd: number;
	srf4_pvd: number;
	srf5_pvd: number;
};

function getValues(area: OLFeature): AreaProps {
	return (area as unknown as { values_: AreaProps }).values_;
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
// updates area fields with pvd, sealed and unsealed
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
		// todo: add correct calculation
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
		to_swale: calculatePrecisely(Number(values.to_swale)),
		to_swale_trench: 0,
		to_trench: 0,
		to_cistern: 0,
		to_surf_infil: 0,
		to_tree_pit: 0,
		unpaving: 0,
		permeable_paving: 0,
	};

	return updateCalculatedFields(current);
}

// R: get_available_m2
// Get available area for each measure, based on current "state" -> potential
function toAreaPotential(areas: ComputedArea): MeasureValues {
	const availableGreenRoof =
		areas.roof - areas.green_roof_ext - areas.green_roof_int;

	return {
		// todo: add correct calculation
		green_roof_ext: calculatePrecisely(availableGreenRoof),
		green_roof_int: calculatePrecisely(availableGreenRoof),
		unpaving: calculatePrecisely(areas.pvd),
		permeable_paving: calculatePrecisely(areas.pvd - areas.pvd_4),
		to_swale: calculatePrecisely(areas.sealed),
		to_swale_trench: calculatePrecisely(areas.sealed),
		to_trench: calculatePrecisely(areas.sealed),
		to_cistern: calculatePrecisely(areas.sealed),
		to_surf_infil: calculatePrecisely(areas.sealed),
		to_tree_pit: calculatePrecisely(areas.sealed),
	};
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
		to_swale: 0,
		to_swale_trench: 0,
		to_trench: 0,
		to_cistern: 0,
		to_surf_infil: 0,
		to_tree_pit: 0,
		unpaving: 0,
		permeable_paving: 0,
	};
}

function createEmptyAreaPotential(): MeasureValues {
	return {
		green_roof_ext: 0,
		green_roof_int: 0,
		unpaving: 0,
		permeable_paving: 0,
		to_swale: 0,
		to_swale_trench: 0,
		to_trench: 0,
		to_cistern: 0,
		to_surf_infil: 0,
		to_tree_pit: 0,
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
		to_swale: calculatePrecisely(acc.to_swale + value.to_swale),
		to_swale_trench: calculatePrecisely(
			acc.to_swale_trench + value.to_swale_trench,
		),
		to_trench: calculatePrecisely(acc.to_trench + value.to_trench),
		to_cistern: calculatePrecisely(acc.to_cistern + value.to_cistern),

		// todo: add correct calculation
		to_surf_infil: calculatePrecisely(acc.to_surf_infil + value.to_surf_infil),
		to_tree_pit: calculatePrecisely(acc.to_tree_pit + value.to_tree_pit),
		unpaving: calculatePrecisely(acc.unpaving + value.unpaving),
		permeable_paving: calculatePrecisely(
			acc.permeable_paving + value.permeable_paving,
		),

		// trees_sm: acc.trees_sm + value.trees_sm,
		// trees_md: acc.trees_md + value.trees_md,
		// trees_lg: acc.trees_lg + value.trees_lg,
	};
}

function addAreaPotentials(
	acc: MeasureValues,
	value: MeasureValues,
): MeasureValues {
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
		to_swale: calculatePrecisely(acc.to_swale + value.to_swale),
		to_swale_trench: calculatePrecisely(
			acc.to_swale_trench + value.to_swale_trench,
		),
		to_trench: calculatePrecisely(acc.to_trench + value.to_trench),
		to_cistern: calculatePrecisely(acc.to_cistern + value.to_cistern),

		// todo: add correct calculation
		to_surf_infil: calculatePrecisely(acc.to_surf_infil + value.to_surf_infil),
		to_tree_pit: calculatePrecisely(acc.to_tree_pit + value.to_tree_pit),
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

const areaCalculations = {
	toComputedArea,
	updateCalculatedFields,
	toAreaPotential,
	preprocessAllFeatures,
	calculatePrecisely,
	addComputedAreas,
	addAreaPotentials,
	createEmptyComputedArea,
	createEmptyAreaPotential,
};

export default areaCalculations;
