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

export interface InputFeature {
	feature: Feature<Geometry>;
	geometry: Geometry | null;
	properties: Record<string, unknown>;
}

export interface ProjectState {
	totalArea: number;
	inputFeatures: InputFeature[];
	inputFeaturesCount: number;
	computedAreas: ComputedArea[];
	areaPotentials: AreaPotential[];
	areaPotential: AreaPotential | null;
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
	setHasHydrated: (state: boolean) => void;
	setLastPath: (path: string | null) => void;
	getLastPath: () => string | null;
}
