import { StorageValue } from "zustand/middleware";
import { FilesStore, createFileKey, parseFileKey } from "./types";

const DB_NAME = "smartwater-bgi-planer";
const STORE_NAME = "layer-files";
const DB_VERSION = 1;

/**
 * Opens or creates the IndexedDB database for file storage
 */
const openDB = (): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
		// Check if we're in a browser environment
		if (typeof window === "undefined" || typeof indexedDB === "undefined") {
			reject(new Error("IndexedDB not available"));
			return;
		}

		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
	});
};

/**
 * Stores a file blob in IndexedDB
 */
export const storeFileBlob = async (
	projectId: string,
	layerId: string,
	file: File,
): Promise<void> => {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	const key = createFileKey(projectId, layerId);

	return new Promise((resolve, reject) => {
		const request = store.put(file, key);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
};

/**
 * Retrieves a file blob from IndexedDB
 */
export const getFileBlob = async (
	projectId: string,
	layerId: string,
): Promise<File | null> => {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, "readonly");
	const store = tx.objectStore(STORE_NAME);
	const key = createFileKey(projectId, layerId);

	return new Promise((resolve, reject) => {
		const request = store.get(key);
		request.onsuccess = () => resolve(request.result || null);
		request.onerror = () => reject(request.error);
	});
};

/**
 * Deletes a file blob from IndexedDB
 */
export const deleteFileBlob = async (
	projectId: string,
	layerId: string,
): Promise<void> => {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	const key = createFileKey(projectId, layerId);

	return new Promise((resolve, reject) => {
		const request = store.delete(key);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
};

/**
 * Deletes all files for a given project
 */
export const deleteProjectFileBlobs = async (
	projectId: string,
): Promise<void> => {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);

	return new Promise((resolve, reject) => {
		const request = store.openCursor();
		const deletePromises: Promise<void>[] = [];

		request.onsuccess = (event) => {
			const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
			if (cursor) {
				const key = cursor.key as string;
				const parsed = parseFileKey(key);
				if (parsed && parsed.projectId === projectId) {
					deletePromises.push(
						new Promise<void>((res, rej) => {
							const delRequest = store.delete(key);
							delRequest.onsuccess = () => res();
							delRequest.onerror = () => rej(delRequest.error);
						}),
					);
				}
				cursor.continue();
			} else {
				Promise.all(deletePromises)
					.then(() => resolve())
					.catch(reject);
			}
		};

		request.onerror = () => reject(request.error);
	});
};

/**
 * Gets all file keys from IndexedDB (across all projects)
 */
export const getAllFileKeys = async (): Promise<string[]> => {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, "readonly");
	const store = tx.objectStore(STORE_NAME);

	return new Promise((resolve, reject) => {
		const request = store.getAllKeys();
		request.onsuccess = () => resolve(request.result as string[]);
		request.onerror = () => reject(request.error);
	});
};

/**
 * Gets all file keys for a given project
 */
export const getProjectFileKeys = async (
	projectId: string,
): Promise<string[]> => {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, "readonly");
	const store = tx.objectStore(STORE_NAME);

	return new Promise((resolve, reject) => {
		const request = store.getAllKeys();
		request.onsuccess = () => {
			const keys = (request.result as string[]).filter((key) => {
				const parsed = parseFileKey(key);
				return parsed && parsed.projectId === projectId;
			});
			resolve(keys);
		};
		request.onerror = () => reject(request.error);
	});
};

/**
 * Custom storage adapter for Zustand persist middleware
 * Stores file metadata in localStorage and actual file blobs in IndexedDB
 */
export const filesStorage = {
	getItem: async (name: string): Promise<StorageValue<FilesStore> | null> => {
		try {
			if (
				typeof window === "undefined" ||
				typeof localStorage === "undefined"
			) {
				return null;
			}

			// Get all files from IndexedDB
			const allKeys = await getAllFileKeys();
			console.log("[filesStorage] Found", allKeys.length, "files in IndexedDB");

			const filesMap = new Map();

			// Load all files from IndexedDB
			for (const key of allKeys) {
				const parsed = parseFileKey(key);
				if (parsed) {
					const file = await getFileBlob(parsed.projectId, parsed.layerId);
					if (file) {
						filesMap.set(key, {
							projectId: parsed.projectId,
							layerId: parsed.layerId,
							file,
							uploadedAt: file.lastModified,
						});
					}
				}
			}

			console.log("[filesStorage] Loaded", filesMap.size, "files into store");

			const localData = localStorage.getItem(name);
			const version = localData
				? (JSON.parse(localData) as { version?: number }).version
				: 0;

			return {
				state: {
					files: filesMap,
					hasHydrated: false,
				},
				version: version || 0,
			} as StorageValue<FilesStore>;
		} catch (error) {
			console.error("Error loading files:", error);
			return null;
		}
	},

	setItem: async (
		name: string,
		value: StorageValue<FilesStore>,
	): Promise<void> => {
		try {
			if (
				typeof window === "undefined" ||
				typeof localStorage === "undefined"
			) {
				return;
			}

			// Store file blobs in IndexedDB
			const files = value.state.files;
			if (files instanceof Map) {
				const storePromises: Promise<void>[] = [];

				for (const [, layerFile] of files.entries()) {
					storePromises.push(
						storeFileBlob(
							layerFile.projectId,
							layerFile.layerId,
							layerFile.file,
						),
					);
				}

				await Promise.all(storePromises);

				// Store only metadata in localStorage (no file blobs)
				const metadataEntries = Array.from(files.entries()).map(
					([key, layerFile]) => [
						key,
						{
							projectId: layerFile.projectId,
							layerId: layerFile.layerId,
							uploadedAt: layerFile.uploadedAt,
						},
					],
				);

				const cleanValue = {
					state: {
						...value.state,
						files: metadataEntries,
					},
				};

				localStorage.setItem(name, JSON.stringify(cleanValue));
			}
		} catch (error) {
			console.error("Error saving files:", error);
			throw error;
		}
	},

	removeItem: async (name: string): Promise<void> => {
		try {
			if (
				typeof window === "undefined" ||
				typeof localStorage === "undefined"
			) {
				return;
			}

			localStorage.removeItem(name);

			// Clear all files from IndexedDB
			const db = await openDB();
			const tx = db.transaction(STORE_NAME, "readwrite");
			const store = tx.objectStore(STORE_NAME);

			return new Promise((resolve, reject) => {
				const request = store.clear();
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});
		} catch (error) {
			console.error("Error removing files:", error);
		}
	},
};
