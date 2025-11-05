import { StoreApi } from "zustand";
import { FilesStore, FilesState, createFileKey, LayerFile } from "./types";
import {
	storeFileBlob,
	deleteFileBlob,
	deleteProjectFileBlobs,
} from "./storage";

export const createAddFile =
	(set: StoreApi<FilesStore>["setState"]) =>
	async (projectId: string, layerId: string, file: File): Promise<void> => {
		const key = createFileKey(projectId, layerId);
		await storeFileBlob(projectId, layerId, file);
		set((state: FilesState) => {
			const newFiles = new Map(state.files);
			newFiles.set(key, {
				projectId,
				layerId,
				file,
				uploadedAt: Date.now(),
			});
			return { files: newFiles };
		});
	};

export const createGetFile =
	(get: StoreApi<FilesStore>["getState"]) =>
	(projectId: string, layerId: string) => {
		const key = createFileKey(projectId, layerId);
		return get().files.get(key) || null;
	};

export const createDeleteFile =
	(set: StoreApi<FilesStore>["setState"]) =>
	async (projectId: string, layerId: string): Promise<void> => {
		const key = createFileKey(projectId, layerId);

		await deleteFileBlob(projectId, layerId);

		set((state: FilesState) => {
			const newFiles = new Map(state.files);
			newFiles.delete(key);
			return { files: newFiles };
		});
	};

export const createDeleteProjectFiles =
	(set: StoreApi<FilesStore>["setState"]) =>
	async (projectId: string): Promise<void> => {
		await deleteProjectFileBlobs(projectId);

		set((state: FilesState) => {
			const newFiles = new Map<string, LayerFile>(state.files);
			for (const [key, file] of newFiles.entries()) {
				if (file.projectId === projectId) {
					newFiles.delete(key);
				}
			}
			return { files: newFiles };
		});
	};

export const createGetAllProjectFiles =
	(get: StoreApi<FilesStore>["getState"]) => (projectId: string) => {
		const files = get().files;
		return Array.from(files.values()).filter(
			(file) => file.projectId === projectId,
		);
	};
