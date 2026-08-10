import type { SectionId } from "@/lib/helpers/sectionIds";

export interface UiState {
	isLayerTreeOpen: boolean;
	openLegendLayerId: string;
	openMeasureCardIds: string[];
	placedMeasureIds: Set<string>;
	selectedConnectedAreaId: string | null;
	currentStepId: string | null;
	uploadError: string | null;
	uploadSuccess: string | null;
	isDrawing: boolean;
	isBlockAreaSelecting: boolean;
	isConnectedAreaSelecting: boolean;
	isDrawingNote: boolean;
	isDrawingMeasure: boolean;
	isLayerTreeVisible: boolean;
	showStepper: boolean;
	moduleCurrentSectionId: SectionId;
	moduleQuestionIndices: Record<SectionId, number>;
	moduleSavedState: {
		sectionId: SectionId;
		questionIndices: Record<SectionId, number>;
	} | null;
	isSynthesisMode: boolean;
	draftMeasureIds: string[];
	draftConnectedAreaIds: string[];
	pendingDeleteMeasureIds: string[];
	isAddMeasureActive: boolean;
}

export interface UiActions {
	setIsLayerTreeOpen: (isOpen: boolean) => void;
	setOpenLegendLayerId: (layerId: string) => void;
	openMeasureCard: (measureId: string) => void;
	closeMeasureCard: (measureId: string) => void;
	closeAllMeasureCards: () => void;
	setPlacedMeasureIds: (ids: Set<string>) => void;
	setSelectedConnectedArea: (connectedAreaId: string | null) => void;
	setCurrentStepId: (stepId: string | null) => void;
	setUploadError: (error: string | null) => void;
	setUploadSuccess: (success: string | null) => void;
	clearUploadStatus: () => void;
	setIsDrawing: (isDrawing: boolean) => void;
	setIsBlockAreaSelecting: (isSelecting: boolean) => void;
	setIsConnectedAreaSelecting: (isSelecting: boolean) => void;
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
	addDraftMeasureId: (measureId: string) => void;
	addDraftConnectedAreaId: (connectedAreaId: string) => void;
	confirmDraftMeasures: () => void;
	clearDraftMeasures: () => void;
	addPendingDeleteMeasureId: (measureId: string) => void;
	clearPendingDeleteMeasureIds: () => void;
	setIsAddMeasureActive: (isAddMeasureActive: boolean) => void;
}
