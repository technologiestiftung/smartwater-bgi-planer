"use client";

import {
	BlockAreaSelector,
	DrawButton,
	DrawNoteButton,
	DrawProjectBoundaryButton,
} from "@/components/DrawControls";
import UploadProjectBoundaryButton from "@/components/UploadControls/UploadProjectBoundaryButton/UploadProjectBoundaryButton";
import { useLayersStore } from "@/store/layers";
import { useUiStore } from "@/store/ui";
import { usePathname } from "next/navigation";

interface DrawControlsContainerProps {
	projectId?: string;
}

export default function DrawControlsContainer({}: DrawControlsContainerProps) {
	const pathname = usePathname();
	const currentStepId = useUiStore((state) => state.currentStepId);
	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const layerConfig = useLayersStore((state) => state.layerConfig);

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
		const currentQuestionConfig = layerConfig.find(
			(config) => config.id === layerConfigId,
		);

		if (currentQuestionConfig) {
			const controlsArray: React.ReactNode[] = [];

			if (currentQuestionConfig.canDrawNotes) {
				controlsArray.push(
					<DrawNoteButton key="notes" layerId="module1_notes" />,
				);
			}
			if (currentQuestionConfig.canDrawPolygons) {
				controlsArray.push(<DrawButton key="draw" />);
			}
			if (currentQuestionConfig.canDrawBTF) {
				controlsArray.push(<BlockAreaSelector key="btf" />);
			}

			controls = <>{controlsArray}</>;
		} else {
			controls = (
				<>
					<DrawNoteButton layerId="module1_notes" />
					<DrawButton />
					<BlockAreaSelector />
				</>
			);
		}
	}

	if (!controls) return null;

	return (
		<div className="absolute right-4 bottom-4 z-48 flex gap-2">{controls}</div>
	);
}
