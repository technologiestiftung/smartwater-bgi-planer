export interface UiState {
	isLayerTreeOpen: boolean;
	openLegendLayerId: string;
	currentStepId: string | null;
}

export interface UiActions {
	setIsLayerTreeOpen: (isOpen: boolean) => void;
	setOpenLegendLayerId: (layerId: string) => void;
	setCurrentStepId: (stepId: string | null) => void;
}
