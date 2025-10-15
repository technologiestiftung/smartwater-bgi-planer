export interface UiState {
	isLayerTreeOpen: boolean;
	openLegendLayerId: string;
}

export interface UiActions {
	setIsLayerTreeOpen: (isOpen: boolean) => void;
	setOpenLegendLayerId: (layerId: string) => void;
}
