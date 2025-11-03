// Project mode type
export type ProjectMode = "multi" | "single";

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
	files?: File[];
	attachments?: Blob[];
	createdAt: number;
	updatedAt: number;
}

export interface ProjectsState {
	projects: Project[];
	_hasHydrated: boolean;
}

export interface ProjectsActions {
	createProject: (project: Omit<Project, "createdAt" | "updatedAt">) => void;
	updateProject: (id: string, updates: Partial<Project>) => void;
	deleteProject: (id: string) => void;
	getProject: (id: string) => Project | undefined;
	getAllProjects: () => Project[];
	setHasHydrated: (state: boolean) => void;
}
