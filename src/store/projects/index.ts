import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProjectsState, ProjectsActions } from "./types";
import { indexedDBStorage } from "./storage";
import {
	createCreateProject,
	createUpdateProject,
	createDeleteProject,
	createGetProject,
	createGetAllProjects,
} from "./actions";

const initialState: ProjectsState = {
	projects: [],
	_hasHydrated: false,
};

export const useProjectsStore = create<ProjectsState & ProjectsActions>()(
	persist(
		(set, get) => ({
			...initialState,
			createProject: createCreateProject(set, get),
			updateProject: createUpdateProject(set),
			deleteProject: createDeleteProject(set),
			getProject: createGetProject(get),
			getAllProjects: createGetAllProjects(get),
			setHasHydrated: (state) => set({ _hasHydrated: state }),
		}),
		{
			name: "projects-storage",
			storage: indexedDBStorage,
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);
