import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProjectsState, ProjectsActions } from "./types";
import {
	createCreateProject,
	createUpdateProject,
	createDeleteProject,
	createGetProject,
} from "./actions";

const initialState: ProjectsState = {
	project: null,
	hasHydrated: false,
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
		}),
		{
			name: "projects-storage",
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);
