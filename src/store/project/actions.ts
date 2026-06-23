import { simulationEngine } from "@/lib/simulation/simulationEngine";
import { useAnswersStore } from "../answers";
import { useFilesStore } from "../files";
import { useMapStore } from "../map";
import { useResultStore } from "../result";
import { useScenarioStore } from "../scenario";
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
		to_swale: 0,
		to_swale_trench: 0,
		to_cistern: 0,
		to_surf_infil: 0,
		to_tree_pit: 0,
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
		to_swale: 0,
		to_swale_trench: 0,
		to_cistern: 0,
		to_surf_infil: 0,
		to_tree_pit: 0,
		trees_sm: 0,
		trees_md: 0,
		trees_lg: 0,
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
			preprocessedStats: null,
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
		useScenarioStore.getState().resetScenarioState();
		useResultStore.getState().resetResultState();
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
		const stats = simulationEngine.preprocessInput(features);

		const computedFeatures: ComputedFeatures[] = stats.features.map((item) => ({
			code: item.code,
			computedArea: item.computedArea,
			areaPotential: item.areaPotential,
		}));

		set({
			inputFeatures: features,
			preprocessedStats: stats,
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

export const createSetActiveArea = (set: SetState, get: GetState) => {
	return (
		code: string | null,
		potential: ProjectState["activeAreaPotential"] = null,
	) => {
		if (!code) {
			set({
				activeAreaId: null,
				activeAreaPotential: null,
			});
			return;
		}

		const resolvedPotential =
			potential ??
			get().computedFeatures.find((feature) => feature.code === code)
				?.areaPotential ??
			null;

		set({
			activeAreaId: code,
			activeAreaPotential: resolvedPotential,
		});
	};
};
