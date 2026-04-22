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

// todo fix types
export interface InputFeature {
	feature: any;
	geometry: any;
	properties: any;
}

export interface ProjectState {
	// Abimo Map input data
	totalArea: number;
	inputFeatures: InputFeature[];
	inputFeaturesCount: number;

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
	setHasHydrated: (state: boolean) => void;
	setLastPath: (path: string | null) => void;
	getLastPath: () => string | null;
}
