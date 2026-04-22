import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
	createCreateProject,
	createDeleteProject,
	createGetLastPath,
	createGetProject,
	createSetLastPath,
	createUpdateProject,
} from "./actions";
import { ProjectActions, ProjectState } from "./types";

const initialState: ProjectState = {
	project: null,
	hasHydrated: false,
	lastPath: null,
};

export const useProjectStore = create<ProjectState & ProjectActions>()(
	persist(
		(set, get) => ({
			...initialState,
			createProject: createCreateProject(set),
			updateProject: createUpdateProject(set, get),
			deleteProject: createDeleteProject(set, get),
			getProject: createGetProject(get),
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
);
