"use client";

import {
	BlockAreaSelector,
	DrawButton,
	DrawMeasureButton,
	DrawNoteButton,
	DrawProjectBoundaryButton,
} from "@/components/DrawControls";
import { UploadDrawLayerButton } from "@/components/UploadControls/UploadDrawLayerButton/UploadDrawLayerButton";
import { selectActiveLayerConfig, useLayersStore } from "@/store/layers";
import { useUiStore } from "@/store/ui";
import { usePathname } from "next/navigation";
// import { Tutorial } from "@/components/Tutorial/Tutorial";

interface DrawControlsContainerProps {
	projectId?: string;
}

// eslint-disable-next-line complexity
export function DrawControlsContainer({}: DrawControlsContainerProps) {
	const pathname = usePathname();
	const currentStepId = useUiStore((state) => state.currentStepId);
	const showTutorial = useUiStore((state) => state.showTutorial);
	const setTutorialState = useUiStore((state) => state.setTutorialState);
	const currentLayerConfig = useLayersStore(selectActiveLayerConfig);

	const isProjectStarter = pathname.includes("/project-starter");
	const isModule =
		pathname.includes("/handlungsbedarfe") ||
		pathname.includes("/machbarkeit") ||
		pathname.includes("/planung");

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
		if (currentLayerConfig) {
			const controlsArray: React.ReactNode[] = [];

			if (currentLayerConfig.canDrawNotes) {
				controlsArray.push(
					<DrawNoteButton key="notes" layerId="project_notes" />,
				);
			}
			if (currentLayerConfig.canDrawPolygons) {
				controlsArray.push(<DrawButton key="draw" />);
			}
			if (currentLayerConfig.canDrawBTF) {
				controlsArray.push(<BlockAreaSelector key="btf" />);
			}
			if (currentLayerConfig.canDrawMeasures) {
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
