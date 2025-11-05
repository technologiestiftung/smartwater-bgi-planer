import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FilesStore, FilesState } from "./types";
import { filesStorage } from "./storage";
import {
	createAddFile,
	createGetFile,
	createDeleteFile,
	createDeleteProjectFiles,
	createGetAllProjectFiles,
} from "./actions";

const initialState: FilesState = {
	files: new Map(),
	hasHydrated: false,
};

export const useFilesStore = create<FilesStore>()(
	persist(
		(set, get) => ({
			...initialState,
			addFile: createAddFile(set),
			getFile: createGetFile(get),
			deleteFile: createDeleteFile(set),
			deleteProjectFiles: createDeleteProjectFiles(set),
			getAllProjectFiles: createGetAllProjectFiles(get),
			setHasHydrated: (state) => set({ hasHydrated: state }),
		}),
		{
			name: "files-storage",
			storage: filesStorage,
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);

// Re-export types and utilities
export * from "./types";
export * from "./storage";
