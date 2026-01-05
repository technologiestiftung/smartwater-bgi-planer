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

export interface ProjectsState {
	project: Project | null;
	hasHydrated: boolean;
}

export interface ProjectsActions {
	createProject: (project: Omit<Project, "createdAt" | "updatedAt">) => void;
	updateProject: (updates: Partial<Project>) => void;
	deleteProject: () => void;
	getProject: () => Project | null;
	setHasHydrated: (state: boolean) => void;
}
