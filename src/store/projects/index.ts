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
import { ProjectsActions, ProjectsState } from "./types";

const initialState: ProjectsState = {
	project: null,
	hasHydrated: false,
	lastPath: null,
};

export const useProjectsStore = create<ProjectsState & ProjectsActions>()(
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
			name: "projects-storage",
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);
