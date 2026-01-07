import { Button } from "@/components/ui/button";
import {
	useAnswersStore,
	useFilesStore,
	useMapStore,
	useProjectsStore,
} from "@/store";
import { UploadIcon } from "@phosphor-icons/react";
import JSZip from "jszip";
import { FC } from "react";

interface ProjectUploaderButtonProps {
	isUploadZoneVisible: boolean;
	files: File[];
	onToggle: () => void;
	onComplete: () => void;
}

const ProjectUploaderButton: FC<ProjectUploaderButtonProps> = ({
	isUploadZoneVisible,
	files,
	onToggle,
	onComplete,
}) => {
	const { createProject } = useProjectsStore();
	const { setAnswer } = useAnswersStore();
	const { updateConfig, setUserLocation } = useMapStore();
	const { addFile } = useFilesStore();

	const handleConfirm = async () => {
		const file = files[0];
		if (!file) return;

		try {
			const zip = new JSZip();
			const zipContent = await zip.loadAsync(file);

			const projectDataFile = zipContent.file("project-data.json");
			if (!projectDataFile) {
				throw new Error("project-data.json not found in zip file");
			}

			const projectDataText = await projectDataFile.async("string");
			const projectData = JSON.parse(projectDataText);

			createProject(projectData.data.project);

			Object.entries(projectData.data.answers).forEach(([key, value]) => {
				setAnswer(key, value as boolean);
			});

			if (projectData.data.map?.mapView) {
				updateConfig({
					startCenter: projectData.data.map.mapView.startCenter,
					startZoomLevel: projectData.data.map.mapView.startZoomLevel,
				});
			}

			if (projectData.data.map?.userLocation) {
				setUserLocation(projectData.data.map.userLocation);
			}

			await Promise.all(
				projectData.data.files.map(async (fileInfo: any) => {
					const layerFile = zipContent.file(fileInfo.metadata.fileName);
					if (layerFile) {
						const fileContent = await layerFile.async("blob");
						const _file = new File([fileContent], fileInfo.metadata.fileName, {
							type: fileInfo.metadata.fileType,
						});

						await addFile({
							projectId: fileInfo.projectId,
							layerId: fileInfo.layerId,
							file: _file,
						});
					}
				}),
			);

			console.log("[ProjectUploaderButton] files added::");

			onComplete();
		} catch (error) {
			console.error("Error loading project:", error);
		}
	};

	if (isUploadZoneVisible && files.length > 0) {
		return (
			<Button variant="default" className="grow" onClick={handleConfirm}>
				<UploadIcon className="mr-2" />
				<p>Projekt importieren</p>
			</Button>
		);
	}

	return (
		<Button variant="outline" className="grow" onClick={onToggle}>
			<UploadIcon className="mr-2" />
			<p>Dateien importieren</p>
		</Button>
	);
};

export default ProjectUploaderButton;
