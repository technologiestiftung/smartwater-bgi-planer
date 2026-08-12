import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
	createCreateProject,
	createDeleteProject,
	createGetLastPath,
	createGetProject,
	createSetActiveArea,
	createSetInputFeatures,
	createSetLastPath,
	createUpdateProject,
	emptyAccumulatedStats,
} from "./actions";
import { ProjectActions, ProjectState } from "./types";

const initialState: ProjectState = {
	// features from rabimo_input_2025 (BTFs) -> amarex: selectedFeatures
	inputFeatures: [],
	// preprocessed base simulation stats derived from inputFeatures
	preprocessedStats: null,
	// stats for the entire BTF project area
	accumulatedStats: emptyAccumulatedStats,
	// stats for each BTF
	computedFeatures: [],
	// Active BTF
	activeAreaPotential: null,
	activeAreaId: null,

	// Project
	project: null,
	hasHydrated: false,
	lastPath: null,
};

export const useProjectStore = create<ProjectState & ProjectActions>()(
	devtools(
		immer(
			persist(
				(set, get) => ({
					...initialState,
					createProject: createCreateProject(set),
					updateProject: createUpdateProject(set, get),
					deleteProject: createDeleteProject(set, get),
					getProject: createGetProject(get),
					setInputFeatures: createSetInputFeatures(set),
					setActiveArea: createSetActiveArea(set, get),
					setHasHydrated: (state) => set({ hasHydrated: state }),
					setLastPath: createSetLastPath(set),
					getLastPath: createGetLastPath(get),
				}),
				{
					name: "project-storage",
					// Exclude large derived/computed fields
					partialize: (state) => ({
						inputFeatures: state.inputFeatures,
						project: state.project,
						activeAreaId: state.activeAreaId,
						lastPath: state.lastPath,
						hasHydrated: state.hasHydrated,
					}),
					onRehydrateStorage: () => (state) => {
						state?.setHasHydrated(true);
					},
				},
			),
		),
		{ name: "projectStore" },
	),
);
