import { downloadProject } from "@/components/ProjectLoader/ProjectDownloadButton/projectExport";
import { Button } from "@/components/ui/button";
import { useProjectsStore } from "@/store";
import { DownloadIcon } from "@phosphor-icons/react";
import { FC, useState } from "react";

interface ProjectDownloadButtonProps {
	projectId: string;
}

const ProjectDownloadButton: FC<ProjectDownloadButtonProps> = ({
	projectId,
}) => {
	const [isDownloading, setIsDownloading] = useState(false);
	const { getProject } = useProjectsStore();

	const handleDownload = async () => {
		if (isDownloading) return;

		try {
			setIsDownloading(true);
			const project = getProject();
			const projectName = project?.name || "Unknown Project";

			await downloadProject(projectId, projectName);
		} catch (error) {
			console.error("Failed to download project:", error);
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="ProjectDownloadButton-root">
			<Button onClick={handleDownload} disabled={isDownloading}>
				<DownloadIcon className="mr-2" />
				{isDownloading ? "Wird heruntergeladen..." : "Download und speichern"}
			</Button>
		</div>
	);
};

export default ProjectDownloadButton;
