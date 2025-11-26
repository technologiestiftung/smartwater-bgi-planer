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
	moduleCurrentSectionId: "heavyRain",
	moduleQuestionIndices: {
		heavyRain: 0,
		heat: 0,
		sealing: 0,
		waterBalance: 0,
		waterProtection: 0,
	},
	moduleSavedState: null,
};

export const useUiStore = create<UiState & UiActions>((set, get) => ({
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
	// Module navigation actions
	setModuleCurrentSection: (sectionId) =>
		set({ moduleCurrentSectionId: sectionId }),
	setModuleQuestionIndex: (sectionId, index) =>
		set((state) => ({
			moduleQuestionIndices: {
				...state.moduleQuestionIndices,
				[sectionId]: index,
			},
		})),
	navigateToModuleQuestion: (sectionId, questionIndex) =>
		set((state) => ({
			moduleCurrentSectionId: sectionId,
			moduleQuestionIndices: {
				...state.moduleQuestionIndices,
				[sectionId]: questionIndex,
			},
		})),
	saveModuleState: () =>
		set((state) => ({
			moduleSavedState: {
				sectionId: state.moduleCurrentSectionId,
				questionIndices: { ...state.moduleQuestionIndices },
			},
		})),
	restoreModuleState: () => {
		const { moduleSavedState } = get();
		if (moduleSavedState) {
			set({
				moduleCurrentSectionId: moduleSavedState.sectionId,
				moduleQuestionIndices: { ...moduleSavedState.questionIndices },
			});
			return moduleSavedState;
		}
		return null;
	},
}));
