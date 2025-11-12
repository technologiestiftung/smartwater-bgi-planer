import { StoreApi } from "zustand";
import {
	deleteFileBlob,
	deleteProjectFileBlobs,
	storeFileBlob,
} from "./storage";
import { createFileKey, FilesState, FilesStore, LayerFile } from "./types";

export const createAddFile =
	(set: StoreApi<FilesStore>["setState"]) =>
	async (params: {
		projectId: string;
		layerId: string;
		file: File;
		displayFileName?: string;
	}): Promise<void> => {
		const { projectId, layerId, file, displayFileName } = params;
		const key = createFileKey(projectId, layerId);
		await storeFileBlob(projectId, layerId, file);
		set((state: FilesState) => {
			const newFiles = new Map(state.files);
			newFiles.set(key, {
				projectId,
				layerId,
				file,
				uploadedAt: Date.now(),
				displayFileName,
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

export const createGetDrawLayerFiles =
	(get: StoreApi<FilesStore>["getState"]) =>
	(projectId: string, drawLayerIds: string[]) => {
		const files = get().files;
		return Array.from(files.values()).filter(
			(file) =>
				file.projectId === projectId && drawLayerIds.includes(file.layerId),
		);
	};

export const createDeleteDrawLayerFiles =
	(set: StoreApi<FilesStore>["setState"]) =>
	async (projectId: string, drawLayerIds: string[]): Promise<void> => {
		const deletePromises = drawLayerIds.map((layerId) =>
			deleteFileBlob(projectId, layerId),
		);
		await Promise.all(deletePromises);

		set((state: FilesState) => {
			const newFiles = new Map<string, LayerFile>(state.files);
			for (const layerId of drawLayerIds) {
				const key = createFileKey(projectId, layerId);
				newFiles.delete(key);
			}
			return { files: newFiles };
		});
	};

export const createAddDrawLayerFile =
	(set: StoreApi<FilesStore>["setState"]) =>
	async (
		projectId: string,
		layerId: string,
		geoJsonContent: string,
	): Promise<void> => {
		const file = new File([geoJsonContent], `${layerId}.geojson`, {
			type: "application/json",
		});

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
