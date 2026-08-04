import { StorageValue } from "zustand/middleware";
import { FilesStore, LayerFile, createFileKey, parseFileKey } from "./types";

const DB_NAME = "smartwater-bgi-planer";
const STORE_NAME = "layer-files";
const DB_VERSION = 1;

interface StoredFileRecord {
	file: File;
	displayFileName?: string;
	uploadedAt: number;
}

let lastPersistedFiles = new Map<string, LayerFile>();

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
	options: { file: File; displayFileName?: string; uploadedAt?: number },
): Promise<void> => {
	const key = createFileKey(projectId, layerId);
	const record: StoredFileRecord = {
		file: options.file,
		displayFileName: options.displayFileName,
		uploadedAt: options.uploadedAt ?? Date.now(),
	};

	const db = await openDB();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);

	store.put(record, key);

	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
};

/**
 * Retrieves the full stored record (file + metadata) for a layer file.
 */
const getFileRecord = async (
	projectId: string,
	layerId: string,
): Promise<StoredFileRecord | null> => {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, "readonly");
	const store = tx.objectStore(STORE_NAME);
	const key = createFileKey(projectId, layerId);

	let result: StoredFileRecord | null = null;

	const request = store.get(key);
	request.onsuccess = () => {
		result = request.result ?? null;
	};

	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve(result);
		tx.onerror = () => reject(tx.error);
	});
};

/**
 * Retrieves a file blob from IndexedDB
 */
export const getFileBlob = async (
	projectId: string,
	layerId: string,
): Promise<File | null> => {
	const record = await getFileRecord(projectId, layerId);
	return record?.file ?? null;
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

	store.delete(key);

	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
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

	const request = store.openCursor();

	request.onsuccess = (event) => {
		const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
		if (cursor) {
			const key = cursor.key as string;
			const parsed = parseFileKey(key);
			if (parsed && parsed.projectId === projectId) {
				store.delete(key);
			}
			cursor.continue();
		}
	};

	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
};

/**
 * Gets all file keys from IndexedDB (across all projects)
 */
export const getAllFileKeys = async (): Promise<string[]> => {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, "readonly");
	const store = tx.objectStore(STORE_NAME);

	let result: string[] = [];

	const request = store.getAllKeys();
	request.onsuccess = () => {
		result = request.result as string[];
	};

	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve(result);
		tx.onerror = () => reject(tx.error);
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

	let result: string[] = [];

	const request = store.getAllKeys();
	request.onsuccess = () => {
		const keys = request.result as string[];
		result = keys.filter((key) => {
			const parsed = parseFileKey(key);
			return parsed && parsed.projectId === projectId;
		});
	};

	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve(result);
		tx.onerror = () => reject(tx.error);
	});
};

/**
 * Writes only the files that are new/changed since the last call, and
 * removes any that dropped out of the map, instead of rewriting everything.
 */
const syncFilesToIndexedDB = async (
	files: Map<string, LayerFile>,
): Promise<void> => {
	const writes: Promise<void>[] = [];

	for (const [key, layerFile] of files.entries()) {
		if (lastPersistedFiles.get(key) === layerFile) continue;
		writes.push(
			storeFileBlob(layerFile.projectId, layerFile.layerId, {
				file: layerFile.file,
				displayFileName: layerFile.displayFileName,
				uploadedAt: layerFile.uploadedAt,
			}),
		);
	}

	for (const [key, layerFile] of lastPersistedFiles.entries()) {
		if (!files.has(key)) {
			writes.push(deleteFileBlob(layerFile.projectId, layerFile.layerId));
		}
	}

	await Promise.all(writes);
	lastPersistedFiles = new Map(files);
};

/**
 * Custom storage adapter for Zustand persist middleware.
 * File + metadata records live in IndexedDB (see storeFileBlob); localStorage
 * only tracks the persist `version` for this store.
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

			const allKeys = await getAllFileKeys();

			const filesMap = new Map<string, LayerFile>();

			// Load all files from IndexedDB
			for (const key of allKeys) {
				const parsed = parseFileKey(key);
				if (parsed) {
					const record = await getFileRecord(parsed.projectId, parsed.layerId);
					if (record) {
						filesMap.set(key, {
							projectId: parsed.projectId,
							layerId: parsed.layerId,
							file: record.file,
							uploadedAt: record.uploadedAt,
							displayFileName: record.displayFileName,
						});
					}
				}
			}

			// Prime the diff cache so the setItem call triggered right after
			// hydration doesn't re-write everything we just read.
			lastPersistedFiles = new Map(filesMap);

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

			const files = value.state.files;
			if (files instanceof Map) {
				await syncFilesToIndexedDB(files);
			}

			try {
				localStorage.setItem(name, JSON.stringify({ version: value.version }));
			} catch (error) {
				const err = error as { name?: string; message?: string };
				console.error("localStorage.setItem failed:", {
					name: err?.name,
					message: err?.message,
				});
				throw error;
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

			store.clear();

			return new Promise((resolve, reject) => {
				tx.oncomplete = () => {
					lastPersistedFiles = new Map();
					resolve();
				};
				tx.onerror = () => reject(tx.error);
			});
		} catch (error) {
			console.error("Error removing files:", error);
		}
	},
};
