import { Measure } from "@/store/scenario/types";
import type { ComputedArea } from "../types";
import areaCalc from "./areaCalculations";

const connectedAreaFieldByMeasure = {
	to_inf_mulde: "to_inf_mulde",
	to_inf_mulde_rigole: "to_inf_mulde_rigole",
	to_inf_rigole: "to_inf_rigole",
	to_retention: "to_retention",
} as const;

type ConnectedAreaMeasureName = keyof typeof connectedAreaFieldByMeasure;

const getConnectedAreaField = (
	name: string | null,
): (typeof connectedAreaFieldByMeasure)[ConnectedAreaMeasureName] | null => {
	if (!name) return null;
	if (name in connectedAreaFieldByMeasure) {
		return connectedAreaFieldByMeasure[name as ConnectedAreaMeasureName];
	}
	return null;
};

const applyGreenRoofMeasure = (
	area: ComputedArea,
	measure: Measure,
	amount: number,
): ComputedArea => {
	const nextGreenRoofExt =
		measure.name === "green_roof_ext"
			? areaCalc.calculatePrecisely(area.green_roof_ext + amount)
			: area.green_roof_ext;
	const nextGreenRoofInt =
		measure.name === "green_roof_int"
			? areaCalc.calculatePrecisely(area.green_roof_int + amount)
			: area.green_roof_int;

	return areaCalc.updateCalculatedFields({
		...area,
		green_roof_ext: nextGreenRoofExt,
		green_roof_int: nextGreenRoofInt,
	});
};

// R: apply_measure
// Applies one measure to one BTF state and then refreshes derived fields.
function calculateApplyMeasure(
	area: ComputedArea,
	measure: Measure,
): ComputedArea {
	const amount = areaCalc.calculatePrecisely(measure.area);

	if (measure.name === "green_roof_ext" || measure.name === "green_roof_int") {
		return applyGreenRoofMeasure(area, measure, amount);
	}

	if (measure.name === "unpaving") {
		const newPvd = areaCalc.calculatePrecisely(area.pvd - amount);
		const scalingFactor = area.pvd === 0 ? 0 : newPvd / area.pvd;

		return areaCalc.updateCalculatedFields({
			...area,
			pvd_1: areaCalc.calculatePrecisely(area.pvd_1 * scalingFactor),
			pvd_2: areaCalc.calculatePrecisely(area.pvd_2 * scalingFactor),
			pvd_3: areaCalc.calculatePrecisely(area.pvd_3 * scalingFactor),
			pvd_4: areaCalc.calculatePrecisely(area.pvd_4 * scalingFactor),
			pvd_na: areaCalc.calculatePrecisely(area.pvd_na * scalingFactor),
		});
	}

	const connectedAreaField = getConnectedAreaField(measure.name);
	if (connectedAreaField) {
		const input = areaCalc.calculatePrecisely(
			measure.connectedArea ?? measure.area,
		);
		return areaCalc.updateCalculatedFields({
			...area,
			[connectedAreaField]: areaCalc.calculatePrecisely(
				area[connectedAreaField] + input,
			),
		});
	}

	if (isNoOpMeasure(measure.name)) {
		return areaCalc.updateCalculatedFields(area);
	}

	const pvdNot4 = area.pvd_1 + area.pvd_2 + area.pvd_3 + area.pvd_na;
	const scalingFactor = pvdNot4 === 0 ? 0 : 1 - (1 / pvdNot4) * amount;

	return areaCalc.updateCalculatedFields({
		...area,
		pvd_4: areaCalc.calculatePrecisely(area.pvd_4 + amount),
		pvd_1: areaCalc.calculatePrecisely(area.pvd_1 * scalingFactor),
		pvd_2: areaCalc.calculatePrecisely(area.pvd_2 * scalingFactor),
		pvd_3: areaCalc.calculatePrecisely(area.pvd_3 * scalingFactor),
		pvd_na: areaCalc.calculatePrecisely(area.pvd_na * scalingFactor),
	});
}

// R: is_no_op
function isNoOpMeasure(name: string | null): boolean {
	return name === null;
}

const measureCalculations = {
	calculateApplyMeasure,
};

export default measureCalculations;
