import { simulationEngine } from "@/lib/simulation/simulationEngine";
import { useAnswersStore } from "../answers";
import { useFilesStore } from "../files";
import { useMapStore } from "../map";
import { useUiStore } from "../ui";
import {
	AccumulatedStats,
	ComputedFeatures,
	InputFeature,
	Project,
	ProjectActions,
	ProjectState,
} from "./types";

type SetState = (partial: Partial<ProjectState & ProjectActions>) => void;
type GetState = () => ProjectState & ProjectActions;

export const emptyAccumulatedStats: AccumulatedStats = {
	totalArea: 0,
	inputFeaturesCount: 0,
	areaPotential: {
		green_roof_ext: 0,
		green_roof_int: 0,
		unpaving: 0,
		permeable_paving: 0,
		to_inf_mulde: 0,
		to_inf_rigole: 0,
		to_inf_mulde_rigole: 0,
		to_retention: 0,
	},
	computedArea: {
		total: 0,
		roof: 0,
		pvd: 0,
		pvd_1: 0,
		pvd_2: 0,
		pvd_3: 0,
		pvd_4: 0,
		pvd_na: 0,
		sealed: 0,
		unsealed: 0,
		green_roof_ext: 0,
		green_roof_int: 0,
		to_inf_mulde: 0,
		to_inf_rigole: 0,
		to_inf_mulde_rigole: 0,
		to_retention: 0,
	},
};

export const createCreateProject = (set: SetState) => {
	return (project: Omit<Project, "createdAt" | "updatedAt">) => {
		const now = Date.now();
		const newProject: Project = {
			...project,
			createdAt: now,
			updatedAt: now,
		};

		set({ project: newProject });
	};
};

export const createUpdateProject = (set: SetState, get: GetState) => {
	return (updates: Partial<Project>) => {
		const state = get();
		if (!state.project) return;

		set({
			project: {
				...state.project,
				...updates,
				updatedAt: Date.now(),
			} as Project,
		});
	};
};

export const createDeleteProject = (set: SetState, get: GetState) => {
	return async () => {
		const state = get();
		const projectId = state.project?.id;
		set({
			project: null,
			inputFeatures: [],
			accumulatedStats: emptyAccumulatedStats,
			computedFeatures: [],
			activeAreaPotential: null,
			activeAreaId: null,
		});

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
		set({ lastPath: path });
	};
};

export const createGetLastPath = (get: GetState) => {
	return () => {
		const state = get();
		return state.lastPath || null;
	};
};

export const createSetInputFeatures = (set: SetState) => {
	return (features: InputFeature[]) => {
		console.log("[useProjectStore] inputFeatures updated", features);

		const stats = simulationEngine.preprocessInput(features);
		console.log("[useProjectStore] preprocessed stats", stats);

		const computedFeatures: ComputedFeatures[] = stats.features.map((item) => ({
			code: item.code,
			computedArea: item.computedArea,
			areaPotential: item.areaPotential,
		}));

		set({
			inputFeatures: features,
			accumulatedStats: {
				totalArea: stats.totalArea,
				inputFeaturesCount: features.length,
				areaPotential: stats.areaPotential,
				computedArea: stats.computedArea,
			},
			computedFeatures,
		});
	};
};
