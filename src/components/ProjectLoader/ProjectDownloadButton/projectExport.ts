import {
	useAnswersStore,
	useFilesStore,
	useMapStore,
	useProjectsStore,
} from "@/store";
import { getFileBlob, getProjectFileKeys } from "@/store/files/storage";
import JSZip from "jszip";

export interface ProjectBackup {
	version: string;
	exportedAt: string;
	projectId: string;
	// todo: fix types
	data: {
		project: any;
		answers: Record<string, boolean | null>;
		map: any;
		files: Array<{
			key: string;
			projectId: string;
			layerId: string;
			metadata: any;
		}>;
	};
}

const BACKUP_VERSION = "1.0.0";

export const collectProjectData = async (
	projectId: string,
): Promise<ProjectBackup> => {
	const projectStore = useProjectsStore.getState();
	const project = projectStore.project;

	if (!project || project.id !== projectId) {
		throw new Error(
			`Project with ID ${projectId} not found or not current project`,
		);
	}

	const [allProjectFiles] = await Promise.all([
		Promise.resolve(useFilesStore.getState().getAllProjectFiles(projectId)),
		getProjectFileKeys(projectId),
	]);

	const filesMetadata = allProjectFiles.map((layerFile) => ({
		key: `${layerFile.projectId}:${layerFile.layerId}`,
		projectId: layerFile.projectId,
		layerId: layerFile.layerId,
		metadata: {
			uploadedAt: layerFile.uploadedAt,
			displayFileName: layerFile.displayFileName,
			fileName: layerFile.file.name,
			fileSize: layerFile.file.size,
			fileType: layerFile.file.type,
			lastModified: layerFile.file.lastModified,
		},
	}));

	return {
		version: BACKUP_VERSION,
		exportedAt: new Date().toISOString(),
		projectId,
		data: {
			project,
			answers: useAnswersStore.getState().answers,
			map: {
				mapView: {
					startCenter:
						useMapStore.getState().config?.portalConfig?.map?.mapView
							.startCenter,
					startZoomLevel:
						useMapStore.getState().config?.portalConfig?.map?.mapView
							.startZoomLevel,
				},
				userLocation: useMapStore.getState().userLocation,
			},
			files: filesMetadata,
		},
	};
};

export const exportProjectAsZip = async (projectId: string): Promise<Blob> => {
	const projectData = await collectProjectData(projectId);
	const zip = new JSZip();

	zip.file("project-data.json", JSON.stringify(projectData, null, 2));

	const fileKeys = await getProjectFileKeys(projectId);

	await Promise.all(
		fileKeys.map(async (fileKey) => {
			const [projId, layerId] = fileKey.split(":");
			if (!projId || !layerId) return;

			const fileBlob = await getFileBlob(projId, layerId);
			if (fileBlob) {
				const fileName = fileBlob.name || `file-${layerId}`;
				zip.file(`files/${layerId}/${fileName}`, fileBlob);
			}
		}),
	);

	return await zip.generateAsync({ type: "blob" });
};

export const downloadProject = async (
	projectId: string,
	projectName?: string,
): Promise<void> => {
	const zipBlob = await exportProjectAsZip(projectId);
	const url = URL.createObjectURL(zipBlob);
	const link = document.createElement("a");

	link.href = url;
	link.download = `${projectName || projectId}-${new Date().toISOString().split("T")[0]}.zip`;

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};
