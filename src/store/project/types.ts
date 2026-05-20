import type { AreaPotential, ComputedArea } from "@/lib/simulation/types";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";

export enum UseCase {
	Individual = "Individual area",
	District = "District",
	Property = "Property",
	PublicSpace = "Streets, paths, squares / green spaces",
}

export interface Project {
	id: string;
	name: string;
	description: string;
	useCase: UseCase;
	createdAt: number;
	updatedAt: number;
}

// Raw area properties read from OL features.
export type AreaProps = {
	code: string;
	prec_yr: number;
	prec_s: number;
	epot_yr: number;
	epot_s: number;
	district: string;
	total_area: number;
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
	to_swale: number;
	gw_dist: number;
	ufc30: number;
	ufc150: number;
	land_type: string;
	veg_class: number;
	irrigation: number;
	block_type: string;
	geometry?: Geometry;
};

export interface InputFeature {
	feature: Feature<Geometry>;
	geometry: Geometry | null;
	properties: AreaProps;
}

export interface AccumulatedStats {
	totalArea: number;
	inputFeaturesCount: number;
	areaPotential: AreaPotential;
	computedArea: ComputedArea;
}

export interface ComputedFeatures {
	code: string;
	computedArea: ComputedArea;
	areaPotential: AreaPotential;
}

export interface ProjectState {
	accumulatedStats: AccumulatedStats;
	inputFeatures: InputFeature[];
	computedFeatures: ComputedFeatures[];

	// Active
	activeAreaPotential: AreaPotential | null;
	activeAreaId: string | null;

	// Project
	project: Project | null;
	hasHydrated: boolean;
	lastPath?: string | null;
}

export interface ProjectActions {
	createProject: (project: Omit<Project, "createdAt" | "updatedAt">) => void;
	updateProject: (updates: Partial<Project>) => void;
	deleteProject: () => void;
	getProject: () => Project | null;
	setInputFeatures: (features: InputFeature[]) => void;
	setActiveArea: (
		code: string | null,
		potential?: AreaPotential | null,
	) => void;
	setHasHydrated: (state: boolean) => void;
	setLastPath: (path: string | null) => void;
	getLastPath: () => string | null;
}
