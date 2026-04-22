"use client";

import { downloadProject } from "@/components/ProjectDownloadButton/projectExport";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store";
import { DownloadIcon } from "@phosphor-icons/react";
import { FC, useState } from "react";

interface ProjectDownloadButtonProps {
	projectId: string;
}

const ProjectDownloadButton: FC<ProjectDownloadButtonProps> = ({
	projectId,
}) => {
	const [isDownloading, setIsDownloading] = useState(false);
	const getProject = useProjectStore((state) => state.getProject);

	const handleDownload = async () => {
		if (isDownloading) return;

		setIsDownloading(true);
		try {
			const project = getProject();
			await downloadProject(projectId, project?.name || "Unknown Project");
		} catch (error) {
			console.error("Failed to download project:", error);
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<Button
			onClick={handleDownload}
			disabled={isDownloading}
			className="w-full"
		>
			<DownloadIcon />
			{isDownloading ? "Wird heruntergeladen..." : "Download und speichern"}
		</Button>
	);
};

export default ProjectDownloadButton;
