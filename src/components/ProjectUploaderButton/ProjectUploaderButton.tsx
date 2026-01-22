"use client";

import { Button } from "@/components/ui/button";
import {
	useAnswersStore,
	useFilesStore,
	useMapStore,
	useProjectsStore,
	useUiStore,
} from "@/store";
import { UploadIcon } from "@phosphor-icons/react";
import JSZip from "jszip";
import { FC } from "react";

interface ProjectUploaderButtonProps {
	isUploadZoneVisible: boolean;
	files: File[];
	onToggle: () => void;
	onComplete: (uploadedProject: any) => void;
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

	const setUploadError = useUiStore((state) => state.setUploadError);
	const uploadError = useUiStore((state) => state.uploadError);
	const clearUploadStatus = useUiStore((state) => state.clearUploadStatus);

	const findFileInZip = (zipContent: JSZip, fileInfo: any) => {
		const paths = [
			fileInfo.metadata.fileName,
			`files/${fileInfo.layerId}/${fileInfo.metadata.fileName}`,
			`${fileInfo.layerId}/${fileInfo.metadata.fileName}`,
		];
		return paths.map((p) => zipContent.file(p)).find(Boolean);
	};

	const handleConfirm = async () => {
		if (!files[0]) return;
		clearUploadStatus();

		try {
			const zipContent = await new JSZip().loadAsync(files[0]);
			const projectFile = zipContent.file("project-data.json");

			if (!projectFile) {
				setUploadError(
					"Diese Datei ist nicht kompatibel mit dem BGI Planer. Bitte wählen Sie eine .zip Datei, der von BGI Planer erstellt wurde.",
				);
				return;
			}

			const { data } = JSON.parse(await projectFile.async("string"));

			createProject(data.project);
			Object.entries(data.answers || {}).forEach(([k, v]) =>
				setAnswer(k, v as boolean),
			);

			if (data.map?.mapView) {
				updateConfig({
					startCenter: data.map.mapView.startCenter,
					startZoomLevel: data.map.mapView.startZoomLevel,
				});
			}
			if (data.map?.userLocation) setUserLocation(data.map.userLocation);

			await Promise.all(
				(data.files || []).map(async (fileInfo: any) => {
					const layerFile = findFileInZip(zipContent, fileInfo);
					if (layerFile) {
						const blob = await layerFile.async("blob");
						const file = new File([blob], fileInfo.metadata.fileName, {
							type: fileInfo.metadata.fileType,
						});
						await addFile({
							projectId: fileInfo.projectId,
							layerId: fileInfo.layerId,
							file,
						});
					}
				}),
			);

			onComplete(data.project);
		} catch (error) {
			console.error("Failed to import project:", error);
			setUploadError(
				"Diese Datei ist nicht kompatibel mit dem BGI Planer. Bitte wählen Sie eine .zip Datei, der von BGI Planer erstellt wurde.",
			);
		}
	};

	const handleButtonClick = () => {
		if (isConfirmMode) {
			handleConfirm();
		} else {
			if (uploadError) {
				clearUploadStatus();
			}
			onToggle();
		}
	};

	const isConfirmMode = isUploadZoneVisible && files.length > 0 && !uploadError;

	return (
		<Button
			variant={isConfirmMode ? "default" : "outline"}
			className="grow"
			onClick={handleButtonClick}
		>
			<UploadIcon className="mr-2" />
			<p>{isConfirmMode ? "Projekt importieren" : "Datei hochladen"}</p>
		</Button>
	);
};

export default ProjectUploaderButton;
