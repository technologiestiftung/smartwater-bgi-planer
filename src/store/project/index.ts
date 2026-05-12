import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
	createCreateProject,
	createDeleteProject,
	createGetLastPath,
	createGetProject,
	createSetInputFeatures,
	createSetLastPath,
	createUpdateProject,
} from "./actions";
import { ProjectActions, ProjectState } from "./types";

const initialState: ProjectState = {
	// Abimo Map input data
	// total Area of all input features
	totalArea: 0,
	// features from Abimo Input 2025 (BTFs) -> amarex: selectedFeatures
	inputFeatures: [],
	inputFeaturesCount: 0,
	// Derived m² values per BTF (Ist-Zustand) — parallel to inputFeatures
	computedAreas: [],
	// Potential m² values for entire project BTF area
	areaPotential: null,
	// Available m² per measure per BTF (Potential) — parallel to inputFeatures
	areaPotentials: [],
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
					setHasHydrated: (state) => set({ hasHydrated: state }),
					setLastPath: createSetLastPath(set),
					getLastPath: createGetLastPath(get),
				}),
				{
					name: "project-storage",
					onRehydrateStorage: () => (state) => {
						state?.setHasHydrated(true);
					},
				},
			),
		),
		{ name: "projectStore" },
	),
);
