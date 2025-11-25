import { UiActions, UiState } from "@/store/ui/types";
import { create } from "zustand";

const initialState: UiState = {
	isLayerTreeOpen: false,
	openLegendLayerId: "",
	currentStepId: null,
	uploadError: null,
	uploadSuccess: null,
	isDrawing: false,
	isBlockAreaSelecting: false,
	isDrawingNote: false,
};

export const useUiStore = create<UiState & UiActions>((set) => ({
	...initialState,
	setIsLayerTreeOpen: (isOpen) => set({ isLayerTreeOpen: isOpen }),
	setOpenLegendLayerId: (layerId) => set({ openLegendLayerId: layerId }),
	setCurrentStepId: (stepId) => set({ currentStepId: stepId }),
	setUploadError: (error) => set({ uploadError: error, uploadSuccess: null }),
	setUploadSuccess: (success) =>
		set({ uploadSuccess: success, uploadError: null }),
	clearUploadStatus: () => set({ uploadError: null, uploadSuccess: null }),
	setIsDrawing: (isDrawing) => set({ isDrawing }),
	setIsBlockAreaSelecting: (isSelecting) =>
		set({ isBlockAreaSelecting: isSelecting }),
	setIsDrawingNote: (isDrawing) => set({ isDrawingNote: isDrawing }),
	resetDrawInteractions: () =>
		set({
			isDrawing: false,
			isBlockAreaSelecting: false,
			isDrawingNote: false,
		}),
}));
