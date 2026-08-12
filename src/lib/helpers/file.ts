export const generateLayerId = (idRoot = "uploaded") =>
	`${idRoot}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const getFileName = (fullName: string) =>
	fullName.replace(/\.[^/.]+$/, "");
