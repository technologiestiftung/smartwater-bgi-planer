import { StorageValue } from "zustand/middleware";
import { ProjectsState, ProjectsActions } from "./types";

const DB_NAME = "smartwater-bgi-planer";
const STORE_NAME = "project-files";
const DB_VERSION = 3;
const LOCAL_STORAGE_KEY = "smartwater-project";

const FILE_FIELDS = ["boundaryFile"] as const;

const openDB = (): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
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

const extractFiles = (
	state: Record<string, unknown>,
): { cleanState: Record<string, unknown>; files: Map<string, Blob> } => {
	const files = new Map<string, Blob>();
	const cleanState = JSON.parse(
		JSON.stringify(state, (key, value) => {
			if (
				FILE_FIELDS.includes(key as (typeof FILE_FIELDS)[number]) &&
				value instanceof Blob
			) {
				files.set(key, value);
				return `__FILE_REF__:${key}`;
			}
			return value;
		}),
	) as Record<string, unknown>;

	return { cleanState, files };
};

const restoreFiles = async (
	state: Record<string, unknown>,
	store: IDBObjectStore,
): Promise<Record<string, unknown>> => {
	const restorePromises: Promise<void>[] = [];

	const traverse = (obj: Record<string, unknown>) => {
		for (const key in obj) {
			const value = obj[key];
			if (typeof value === "string" && value.startsWith("__FILE_REF__:")) {
				const fieldName = value.replace("__FILE_REF__:", "");
				restorePromises.push(
					new Promise<void>((resolve) => {
						const request = store.get(fieldName);
						request.onsuccess = () => {
							obj[key] = request.result || null;
							resolve();
						};
						request.onerror = () => {
							obj[key] = null;
							resolve();
						};
					}),
				);
			} else if (typeof value === "object" && value !== null) {
				traverse(value as Record<string, unknown>);
			}
		}
	};

	traverse(state);
	await Promise.all(restorePromises);
	return state;
};

export const hybridStorage = {
	getItem: async (
		name: string,
	): Promise<StorageValue<ProjectsState & ProjectsActions> | null> => {
		try {
			const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (!localData) return null;

			const parsed = JSON.parse(localData);

			const hasFileRefs = JSON.stringify(parsed).includes("__FILE_REF__:");
			if (!hasFileRefs) return parsed;

			const db = await openDB();
			const tx = db.transaction(STORE_NAME, "readonly");
			const store = tx.objectStore(STORE_NAME);

			await restoreFiles(parsed, store);
			return parsed;
		} catch (error) {
			console.error("Error loading project:", error);
			return null;
		}
	},

	setItem: async (
		name: string,
		value: StorageValue<ProjectsState & ProjectsActions>,
	): Promise<void> => {
		try {
			const stateOnly = { state: value.state };
			const { cleanState, files } = extractFiles(stateOnly);

			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanState));

			const db = await openDB();
			const tx = db.transaction(STORE_NAME, "readwrite");
			const store = tx.objectStore(STORE_NAME);

			const promises: Promise<void>[] = [];

			for (const [fieldName, blob] of files) {
				promises.push(
					new Promise((resolve, reject) => {
						const request = store.put(blob, fieldName);
						request.onsuccess = () => resolve();
						request.onerror = () => reject(request.error);
					}),
				);
			}

			const allFieldNames = FILE_FIELDS as readonly string[];
			for (const fieldName of allFieldNames) {
				if (!files.has(fieldName)) {
					promises.push(
						new Promise((resolve) => {
							const request = store.delete(fieldName);
							request.onsuccess = () => resolve();
							request.onerror = () => resolve(); // Don't fail on delete
						}),
					);
				}
			}

			await Promise.all(promises);
		} catch (error) {
			console.error("Error saving project:", error);
			throw error;
		}
	},

	removeItem: async (name: string): Promise<void> => {
		try {
			localStorage.removeItem(LOCAL_STORAGE_KEY);

			const db = await openDB();
			const tx = db.transaction(STORE_NAME, "readwrite");
			const store = tx.objectStore(STORE_NAME);

			const promises = (FILE_FIELDS as readonly string[]).map(
				(fieldName) =>
					new Promise<void>((resolve) => {
						const request = store.delete(fieldName);
						request.onsuccess = () => resolve();
						request.onerror = () => resolve();
					}),
			);

			await Promise.all(promises);
		} catch (error) {
			console.error("Error removing project:", error);
		}
	},
};
