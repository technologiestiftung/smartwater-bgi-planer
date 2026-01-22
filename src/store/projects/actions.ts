import { useAnswersStore } from "../answers";
import { useFilesStore } from "../files";
import { useMapStore } from "../map";
import { useUiStore } from "../ui";
import { Project, ProjectsState } from "./types";

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
		// Reset all answers and module state
		useAnswersStore.getState().clearAnswers();
		useUiStore.getState().resetModuleState();
		useMapStore.getState().resetMapState();
	};
};

export const createGetProject = (get: GetState) => {
	return () => {
		const state = get();
		return state.project;
	};
};

export const createSetLastPath = (set: SetState) => {
	return (path: string | null) => {
		set((state) => ({ ...state, lastPath: path }));
	};
};

export const createGetLastPath = (get: GetState) => {
	return () => {
		const state = get();
		return state.lastPath || null;
	};
};
