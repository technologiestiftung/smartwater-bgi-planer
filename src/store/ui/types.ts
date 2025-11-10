export interface UiState {
	isLayerTreeOpen: boolean;
	openLegendLayerId: string;
	currentStepId: string | null;
	uploadError: string | null;
	uploadSuccess: string | null;
}

export interface UiActions {
	setIsLayerTreeOpen: (isOpen: boolean) => void;
	setOpenLegendLayerId: (layerId: string) => void;
	setCurrentStepId: (stepId: string | null) => void;
	setUploadError: (error: string | null) => void;
	setUploadSuccess: (success: string | null) => void;
	clearUploadStatus: () => void;
}
