"use client";

import BlockAreaSelector from "@/components/BlockAreaSelector/BlockAreaSelector";
import {
	DrawButton,
	DrawMeasureButton,
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

	if (isProjectStarter) {
		// Different controls based on the current step
		if (currentStepId === "projectBoundary") {
			return (
				<div className="absolute right-4 bottom-4 z-48 flex gap-2">
					<DrawProjectBoundaryButton />
					<UploadProjectBoundaryButton />
				</div>
			);
		}

		if (currentStepId === "newDevelopment") {
			return (
				<div className="absolute right-40 bottom-4 z-48 flex gap-2">
					<DrawButton />
				</div>
			);
		}

		return (
			<div className="absolute right-40 bottom-4 z-48 flex gap-2">
				<DrawProjectBoundaryButton />
				<UploadProjectBoundaryButton />
			</div>
		);
	}

	if (isHandlungsbedarfe) {
		return (
			<div className="absolute right-40 bottom-4 z-48 flex gap-2">
				<DrawMeasureButton layerId="handlungsbedarfe_measures" />
				<DrawNoteButton layerId="handlungsbedarfe_notes" />
				<BlockAreaSelector />
			</div>
		);
	}

	return null;
}
