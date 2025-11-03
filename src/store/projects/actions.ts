import { Project, ProjectsState } from "./types";
import { PROJECT_MODE } from "./config";

type SetState = (fn: (state: ProjectsState) => Partial<ProjectsState>) => void;
type GetState = () => ProjectsState;

export const createCreateProject = (set: SetState) => {
	return (project: Omit<Project, "createdAt" | "updatedAt">) => {
		const now = Date.now();
		const newProject: Project = {
			...project,
			createdAt: now,
			updatedAt: now,
		};

		set((state) => ({
			projects:
				PROJECT_MODE === "single"
					? [newProject]
					: [...state.projects, newProject],
		}));
	};
};

export const createUpdateProject = (set: SetState) => {
	return (id: string, updates: Partial<Project>) => {
		set((state) => ({
			projects: state.projects.map((project) =>
				project.id === id
					? { ...project, ...updates, updatedAt: Date.now() }
					: project,
			),
		}));
	};
};

export const createDeleteProject = (set: SetState) => {
	return (id: string) => {
		set((state) => ({
			projects: state.projects.filter((project) => project.id !== id),
		}));
	};
};

export const createGetProject = (get: GetState) => {
	return (id: string) => {
		const state = get();
		return state.projects.find((project) => project.id === id);
	};
};

export const createGetAllProjects = (get: GetState) => {
	return () => {
		const state = get();
		return state.projects;
	};
};
