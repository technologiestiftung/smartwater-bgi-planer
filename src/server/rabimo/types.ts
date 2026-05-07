export interface RabimoFeature {
	code: string;
	prec_yr: number;
	prec_s: number;
	epot_yr: number;
	epot_s: number;
	district: string;
	total_area: number;
	area_main: number;
	area_rd: number;
	main_frac: number;
	roof: number;
	green_roof: number;
	swg_roof: number;
	pvd: number;
	swg_pvd: number;
	srf1_pvd: number;
	srf2_pvd: number;
	srf3_pvd: number;
	srf4_pvd: number;
	srf5_pvd: number;
	road_frac: number;
	pvd_r: number;
	swg_pvd_r: number;
	srf1_pvd_r: number;
	srf2_pvd_r: number;
	srf3_pvd_r: number;
	srf4_pvd_r: number;
	sealed: number;
	to_swale: number;
	gw_dist: number;
	ufc30: number;
	ufc150: number;
	land_type: string;
	veg_class: number;
	irrigation: number;
	block_type: string;
}

export interface RabimoTargets {
	green_roof: number;
	to_swale: number;
	unpaved: number;
}

export interface RabimoPayload {
	features: RabimoFeature[];
	targets: RabimoTargets;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

function isRabimoFeature(value: unknown): value is RabimoFeature {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.code === "string" &&
		typeof value.district === "string" &&
		typeof value.land_type === "string" &&
		typeof value.block_type === "string" &&
		isNumber(value.total_area) &&
		isNumber(value.area_main) &&
		isNumber(value.area_rd)
	);
}

function isRabimoTargets(value: unknown): value is RabimoTargets {
	if (!isRecord(value)) {
		return false;
	}

	return (
		isNumber(value.green_roof) &&
		isNumber(value.to_swale) &&
		isNumber(value.unpaved)
	);
}

export function isRabimoPayload(value: unknown): value is RabimoPayload {
	if (!isRecord(value)) {
		return false;
	}

	if (!Array.isArray(value.features) || !isRabimoTargets(value.targets)) {
		return false;
	}

	return value.features.every(isRabimoFeature);
}
