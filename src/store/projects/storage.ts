import { StorageValue } from "zustand/middleware";
import { ProjectsState, ProjectsActions } from "./types";

const DB_NAME = "smartwater-bgi-planer";
const STORE_NAME = "projects-list";
const DB_VERSION = 2; // Incremented to create new object store

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

			if (!db.objectStoreNames.contains("zustand")) {
				db.createObjectStore("zustand");
			}
		};
	});
};

export const indexedDBStorage = {
	getItem: async (
		name: string,
	): Promise<StorageValue<ProjectsState & ProjectsActions> | null> => {
		return new Promise((resolve, reject) => {
			openDB()
				.then((db) => {
					try {
						const tx = db.transaction(STORE_NAME, "readonly");
						const store = tx.objectStore(STORE_NAME);
						const request = store.get(name);

						request.onsuccess = () => {
							const result = request.result;
							resolve(result ? JSON.parse(result) : null);
						};
						request.onerror = () => reject(request.error);
					} catch (error) {
						console.error("Error accessing store:", error);
						resolve(null);
					}
				})
				.catch((error) => {
					console.error("Error opening database:", error);
					resolve(null);
				});
		});
	},
	setItem: async (
		name: string,
		value: StorageValue<ProjectsState & ProjectsActions>,
	): Promise<void> => {
		return new Promise((resolve, reject) => {
			openDB()
				.then((db) => {
					try {
						const tx = db.transaction(STORE_NAME, "readwrite");
						const store = tx.objectStore(STORE_NAME);
						const request = store.put(JSON.stringify(value), name);

						request.onsuccess = () => resolve();
						request.onerror = () => reject(request.error);
					} catch (error) {
						console.error("Error accessing store:", error);
						reject(error);
					}
				})
				.catch((error) => {
					console.error("Error opening database:", error);
					reject(error);
				});
		});
	},
	removeItem: async (name: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			openDB()
				.then((db) => {
					try {
						const tx = db.transaction(STORE_NAME, "readwrite");
						const store = tx.objectStore(STORE_NAME);
						const request = store.delete(name);

						request.onsuccess = () => resolve();
						request.onerror = () => reject(request.error);
					} catch (error) {
						console.error("Error accessing store:", error);
						reject(error);
					}
				})
				.catch((error) => {
					console.error("Error opening database:", error);
					reject(error);
				});
		});
	},
};
