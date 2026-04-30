"use client";

import {
	BlockAreaSelector,
	DrawButton,
	DrawNoteButton,
	DrawProjectBoundaryButton,
	DrawMeasureButton,
} from "@/components/DrawControls";
import { UploadDrawLayerButton } from "@/components/UploadControls/UploadDrawLayerButton/UploadDrawLayerButton";
import { useLayersStore } from "@/store/layers";
import { useUiStore } from "@/store/ui";
import { usePathname } from "next/navigation";
// import { Tutorial } from "@/components/Tutorials/Tutorial";

interface DrawControlsContainerProps {
	projectId?: string;
}

// eslint-disable-next-line complexity
export function DrawControlsContainer({}: DrawControlsContainerProps) {
	const pathname = usePathname();
	const currentStepId = useUiStore((state) => state.currentStepId);
	const showTutorial = useUiStore((state) => state.showTutorial);
	const setTutorialState = useUiStore((state) => state.setTutorialState);
	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const layerConfig = useLayersStore((state) => state.layerConfig);

	const isProjectStarter = pathname.includes("/project-starter");
	const isModule =
		pathname.includes("/handlungsbedarfe") ||
		pathname.includes("/machbarkeit") ||
		pathname.includes("/planung");

	let controls: React.ReactNode = null;

	const currentQuestionConfig = layerConfig.find(
		(config) => config.id === layerConfigId,
	);

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
		if (currentQuestionConfig) {
			const controlsArray: React.ReactNode[] = [];

			if (currentQuestionConfig.canDrawNotes) {
				controlsArray.push(
					<DrawNoteButton key="notes" layerId="project_notes" />,
				);
			}
			if (currentQuestionConfig.canDrawPolygons) {
				controlsArray.push(<DrawButton key="draw" />);
			}
			if (currentQuestionConfig.canDrawBTF) {
				controlsArray.push(<BlockAreaSelector key="btf" />);
			}
			if (currentQuestionConfig.canDrawMeasures) {
				controlsArray.push(<DrawMeasureButton key="measure" />);
			}

			controls = <>{controlsArray}</>;
		} else {
			controls = (
				<>
					<DrawNoteButton layerId="project_notes" />
					<DrawButton />
					<BlockAreaSelector />
				</>
			);
		}
	}

	if (!controls) return null;

	return (
		<div className="absolute right-4 bottom-8 z-52">
			{/* <Tutorial type="controls" /> */}
			<div
				className="relative mt-2 flex justify-center gap-2"
				onClick={() => {
					if (showTutorial) {
						setTutorialState(false);
					}
				}}
			>
				{controls}
			</div>
		</div>
	);
}
