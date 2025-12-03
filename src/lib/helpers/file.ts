/**
 * Generates a random layer ID based on the given idRoot.
 * @param {idRoot} The root of the layer ID
 * @returns A random layer ID
 */
export const generateLayerId = (idRoot = "uploaded") =>
	`${idRoot}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

/**
 * Returns the file name from a full file name.
 * @param {fullName} The full file name
 * @returns The file name
 */
export const getFileName = (fullName: string) =>
	fullName.replace(/\.[^/.]+$/, "");
