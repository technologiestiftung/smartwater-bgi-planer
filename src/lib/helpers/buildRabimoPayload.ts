import { measureConfigById } from "@/config/measuresConfig";
import type {
	RabimoFeature,
	RabimoMeasure,
	RabimoPayload,
} from "@/server/rabimo/types";
import type { InputFeature } from "@/store/project/types";
import type { Measure } from "@/store/scenario/types";

/**
 * Maps MeasureKey (from measuresConfig) to the corresponding RabimoMeasure field.
 */
const MEASURE_KEY_TO_RABIMO: Partial<Record<string, keyof RabimoMeasure>> = {
	green_roof_ext: "green_roof_ext",
	green_roof_int: "green_roof_int",
	permeable_paving: "permeable_paving",
	unpaving: "unpaving",
	to_swale: "to_swale",
	to_surf_infil: "to_surf_infil",
	to_swale_trench: "to_swale_trench",
	to_tree_pit: "to_tree_pit",
	// todo: trees -> trees_sm / trees_md / trees_lg (size from measure values)
	// todo: to_trench mapping
	to_cistern: "to_cistern",
	to_trench: "to_trench",
};

const createEmptyRabimoMeasure = (code: string): RabimoMeasure => ({
	code,
	green_roof_ext: 0,
	green_roof_int: 0,
	permeable_paving: 0,
	unpaving: 0,
	trees_sm: 0,
	trees_md: 0,
	trees_lg: 0,
	to_swale: 0,
	to_surf_infil: 0,
	to_swale_trench: 0,
	to_trench: 0,
	to_tree_pit: 0,
	to_cistern: 0,
});

export function buildRabimoPayload(
	inputFeatures: InputFeature[],
	measures: Measure[],
): RabimoPayload {
	// Build blocks from input features, excluding the OL geometry object
	const blocks: RabimoFeature[] = inputFeatures.map((f) => {
		const { geometry: _geometry, ...props } = f.properties;

		return props as RabimoFeature;
	});

	// Initialise a measure entry for every known block code
	const measuresByCode = new Map<string, RabimoMeasure>();
	for (const feature of inputFeatures) {
		const code = feature.properties.code;
		measuresByCode.set(code, createEmptyRabimoMeasure(code));
	}

	// Accumulate measure areas into the corresponding rabimo keys
	for (const measure of measures) {
		if (!measure.code) continue;

		const config = measureConfigById.get(measure.configId);
		if (!config?.measureKey) continue;

		// todo: check MEASURE_KEY_TO_RABIMO if neccessary or can be refactored
		const rabimoKey = MEASURE_KEY_TO_RABIMO[config.measureKey];
		if (!rabimoKey) continue;

		const entry = measuresByCode.get(measure.code);
		if (!entry) continue;

		(entry[rabimoKey] as number) += measure.area;
	}

	return {
		blocks,
		measures: Array.from(measuresByCode.values()),
	};
}
