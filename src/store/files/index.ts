import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
	createAddDrawLayerFile,
	createAddFile,
	createDeleteDrawLayerFiles,
	createDeleteFile,
	createDeleteProjectFiles,
	createGetAllProjectFiles,
	createGetDrawLayerFiles,
	createGetFile,
} from "./actions";
import { filesStorage } from "./storage";
import { FilesState, FilesStore } from "./types";

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
			getDrawLayerFiles: createGetDrawLayerFiles(get),
			deleteDrawLayerFiles: createDeleteDrawLayerFiles(set),
			addDrawLayerFile: createAddDrawLayerFile(set),
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
export * from "./storage";
export * from "./types";
