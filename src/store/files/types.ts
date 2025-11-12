export interface LayerFile {
	projectId: string;
	layerId: string;
	file: File;
	uploadedAt: number;
	displayFileName?: string;
}

export interface FilesState {
	files: Map<string, LayerFile>;
	hasHydrated: boolean;
}

export interface FilesActions {
	addFile: (params: {
		projectId: string;
		layerId: string;
		file: File;
		displayFileName?: string;
	}) => Promise<void>;
	getFile: (projectId: string, layerId: string) => LayerFile | null;
	deleteFile: (projectId: string, layerId: string) => Promise<void>;
	deleteProjectFiles: (projectId: string) => Promise<void>;
	getAllProjectFiles: (projectId: string) => LayerFile[];
	setHasHydrated: (state: boolean) => void;
	getDrawLayerFiles: (projectId: string, drawLayerIds: string[]) => LayerFile[];
	deleteDrawLayerFiles: (
		projectId: string,
		drawLayerIds: string[],
	) => Promise<void>;
	addDrawLayerFile: (
		projectId: string,
		layerId: string,
		geoJsonContent: string,
	) => Promise<void>;
}

export type FilesStore = FilesState & FilesActions;

export const createFileKey = (projectId: string, layerId: string): string => {
	return `${projectId}:${layerId}`;
};

export const parseFileKey = (
	key: string,
): { projectId: string; layerId: string } | null => {
	const parts = key.split(":");
	if (parts.length !== 2) return null;
	return { projectId: parts[0], layerId: parts[1] };
};
