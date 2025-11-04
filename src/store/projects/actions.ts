import { Project, ProjectsState } from "./types";
import { useFilesStore } from "../files";

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

		set(() => ({ project: newProject }));
	};
};

export const createUpdateProject = (set: SetState, get: GetState) => {
	return (updates: Partial<Project>) => {
		const state = get();
		if (!state.project) return;

		set(() => ({
			project: {
				...state.project,
				...updates,
				updatedAt: Date.now(),
			} as Project,
		}));
	};
};

export const createDeleteProject = (set: SetState, get: GetState) => {
	return async () => {
		const state = get();
		const projectId = state.project?.id;
		set(() => ({ project: null }));
		if (projectId) {
			await useFilesStore.getState().deleteProjectFiles(projectId);
		}
	};
};

export const createGetProject = (get: GetState) => {
	return () => {
		const state = get();
		return state.project;
	};
};
