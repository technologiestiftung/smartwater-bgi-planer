"use client";

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

	const findFileInZip = (zipContent: JSZip, fileInfo: any) => {
		const paths = [
			fileInfo.metadata.fileName,
			`files/${fileInfo.layerId}/${fileInfo.metadata.fileName}`,
			`${fileInfo.layerId}/${fileInfo.metadata.fileName}`,
		];

		return paths.map((p) => zipContent.file(p)).find(Boolean);
	};

	const restoreAnswers = (answers: Record<string, boolean>) => {
		Object.entries(answers).forEach(([key, value]) => setAnswer(key, value));
	};

	const restoreMap = (mapData: any) => {
		if (mapData?.mapView) {
			updateConfig({
				startCenter: mapData.mapView.startCenter,
				startZoomLevel: mapData.mapView.startZoomLevel,
			});
		}
		if (mapData?.userLocation) setUserLocation(mapData.userLocation);
	};

	const restoreFiles = async (zipContent: JSZip, filesData: any[]) => {
		const filePromises = filesData.map(async (fileInfo) => {
			const layerFile = findFileInZip(zipContent, fileInfo);

			if (!layerFile) {
				console.error("File not found in zip:", fileInfo.metadata.fileName);
				return;
			}

			const blob = await layerFile.async("blob");
			const file = new File([blob], fileInfo.metadata.fileName, {
				type: fileInfo.metadata.fileType,
			});

			await addFile({
				projectId: fileInfo.projectId,
				layerId: fileInfo.layerId,
				file,
			});
		});

		await Promise.all(filePromises);
	};

	const handleConfirm = async () => {
		if (!files[0]) return;

		try {
			const zipContent = await new JSZip().loadAsync(files[0]);
			const projectFile = zipContent.file("project-data.json");

			if (!projectFile) throw new Error("project-data.json not found");

			const { data } = JSON.parse(await projectFile.async("string"));

			createProject(data.project);
			restoreAnswers(data.answers);
			restoreMap(data.map);
			await restoreFiles(zipContent, data.files);

			onComplete(data.project);
		} catch (error) {
			console.error("Error loading project:", error);
		}
	};

	const isConfirmMode = isUploadZoneVisible && files.length > 0;

	return (
		<Button
			variant={isConfirmMode ? "default" : "outline"}
			className="grow"
			onClick={isConfirmMode ? handleConfirm : onToggle}
		>
			<UploadIcon className="mr-2" />
			<p>{isConfirmMode ? "Projekt importieren" : "Dateien importieren"}</p>
		</Button>
	);
};

export default ProjectUploaderButton;
