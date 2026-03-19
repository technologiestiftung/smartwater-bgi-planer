import type { SectionId } from "@/lib/helpers/sectionIds";

export interface UiState {
	isLayerTreeOpen: boolean;
	openLegendLayerId: string;
	currentStepId: string | null;
	uploadError: string | null;
	uploadSuccess: string | null;
	isDrawing: boolean;
	isBlockAreaSelecting: boolean;
	isDrawingNote: boolean;
	isLayerTreeVisible: boolean;
	showStepper: boolean;
	moduleCurrentSectionId: SectionId;
	moduleQuestionIndices: Record<SectionId, number>;
	moduleSavedState: {
		sectionId: SectionId;
		questionIndices: Record<SectionId, number>;
	} | null;
	isSynthesisMode: boolean;
	showTutorial: boolean;
}

export interface UiActions {
	setIsLayerTreeOpen: (isOpen: boolean) => void;
	setOpenLegendLayerId: (layerId: string) => void;
	setCurrentStepId: (stepId: string | null) => void;
	setUploadError: (error: string | null) => void;
	setUploadSuccess: (success: string | null) => void;
	clearUploadStatus: () => void;
	setIsDrawing: (isDrawing: boolean) => void;
	setIsBlockAreaSelecting: (isSelecting: boolean) => void;
	setIsDrawingNote: (isDrawing: boolean) => void;
	resetDrawInteractions: () => void;
	setShowStepper: (show: boolean) => void;
	setIsLayerTreeVisible: (isVisible: boolean) => void;
	setModuleCurrentSection: (sectionId: SectionId) => void;
	setModuleQuestionIndex: (sectionId: SectionId, index: number) => void;
	navigateToModuleQuestion: (
		sectionId: SectionId,
		questionIndex: number,
	) => void;
	saveModuleState: () => void;
	restoreModuleState: () => {
		sectionId: SectionId;
		questionIndices: Record<SectionId, number>;
	} | null;
	setIsSynthesisMode: (isSynthesisMode: boolean) => void;
	resetModuleState: () => void;
	setTutorialState: (showTutorial: boolean) => void;
}
