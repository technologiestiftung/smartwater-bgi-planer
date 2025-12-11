"use client";

import {
	BlockAreaSelector,
	DrawButton,
	DrawNoteButton,
	DrawProjectBoundaryButton,
} from "@/components/DrawControls";
import UploadDrawLayerButton from "@/components/UploadControls/UploadDrawLayerButton/UploadDrawLayerButton";
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
	const isModule =
		pathname.includes("/handlungsbedarfe") || pathname.includes("/machbarkeit");

	let controls: React.ReactNode = null;

	if (isProjectStarter) {
		if (currentStepId === "newDevelopment") {
			controls = (
				<>
					<DrawButton />
					<UploadDrawLayerButton />
				</>
			);
		} else if (currentStepId === "projectBoundary") {
			controls = (
				<>
					<DrawProjectBoundaryButton />
					<UploadDrawLayerButton />
				</>
			);
		}
	} else if (isModule) {
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
		<div className="absolute right-4 bottom-8 z-48 flex gap-2">{controls}</div>
	);
}
