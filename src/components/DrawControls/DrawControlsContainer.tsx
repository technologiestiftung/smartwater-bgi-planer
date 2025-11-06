"use client";

import BlockAreaSelector from "@/components/BlockAreaSelector/BlockAreaSelector";
import {
	DrawButton,
	DrawNoteButton,
	DrawProjectBoundaryButton,
} from "@/components/DrawControls";
import UploadProjectBoundaryButton from "@/components/UploadProjectBoundaryButton/UploadProjectBoundaryButton";
import { useUiStore } from "@/store/ui";
import { usePathname } from "next/navigation";

interface DrawControlsContainerProps {
	projectId?: string;
}

export default function DrawControlsContainer({}: DrawControlsContainerProps) {
	const pathname = usePathname();
	const currentStepId = useUiStore((state) => state.currentStepId);

	const isProjectStarter = pathname.includes("/project-starter");
	const isHandlungsbedarfe = pathname.includes("/handlungsbedarfe");

	let controls: React.ReactNode = null;

	if (isProjectStarter) {
		if (currentStepId === "newDevelopment") {
			controls = <DrawButton />;
		} else if (currentStepId === "projectBoundary") {
			controls = (
				<>
					<DrawProjectBoundaryButton />
					<UploadProjectBoundaryButton />
				</>
			);
		}
	} else if (isHandlungsbedarfe) {
		controls = (
			<>
				<DrawNoteButton layerId="module1_notes" />
				<DrawButton />
				<BlockAreaSelector />
			</>
		);
	}

	if (!controls) return null;

	return (
		<div className="absolute right-4 bottom-4 z-48 flex gap-2">{controls}</div>
	);
}
