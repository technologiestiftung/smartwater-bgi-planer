import { getModuleSteps } from "@/components/Modules/shared/moduleConfig";
import { UiActions, UiState } from "@/store/ui/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const getInitialModuleQuestionIndices = () => {
	const indices: Record<string, number> = {};
	const needForActionSteps = getModuleSteps("needForAction");
	const feasibilitySteps = getModuleSteps("feasibility");
	const measurePlanningSteps = getModuleSteps("measurePlanning");

	[...needForActionSteps, ...feasibilitySteps, ...measurePlanningSteps].forEach(
		(step) => {
			indices[step.id] = 0;
		},
	);
	return indices;
};

const initialState: UiState = {
	isLayerTreeOpen: false,
	openLegendLayerId: "",
	openMeasureCardIds: [],
	placedMeasureIds: new Set<string>(),
	selectedConnectedAreaId: null,
	currentStepId: null,
	uploadError: null,
	uploadSuccess: null,
	isDrawing: false,
	isBlockAreaSelecting: false,
	isConnectedAreaSelecting: false,
	isDrawingNote: false,
	isLayerTreeVisible: false,
	isDrawingMeasure: false,
	showStepper: true,
	moduleCurrentSectionId: "heavyRain",
	moduleQuestionIndices: getInitialModuleQuestionIndices(),
	moduleSavedState: null,
	isSynthesisMode: false,
	showTutorial: false,
	showTutorialOnFirstQuestion: false,
};

export const useUiStore = create<UiState & UiActions>()(
	devtools(
		immer((set, get) => ({
			...initialState,
			setIsLayerTreeOpen: (isOpen) => set({ isLayerTreeOpen: isOpen }),
			setOpenLegendLayerId: (layerId) => set({ openLegendLayerId: layerId }),
			openMeasureCard: (measureId) =>
				set((state) => ({
					openMeasureCardIds: state.openMeasureCardIds.includes(measureId)
						? state.openMeasureCardIds
						: [...state.openMeasureCardIds, measureId],
				})),
			setPlacedMeasureIds: (ids) => set({ placedMeasureIds: new Set(ids) }),
			closeMeasureCard: (measureId) =>
				set((state) => ({
					openMeasureCardIds: state.openMeasureCardIds.filter(
						(id) => id !== measureId,
					),
				})),
			closeAllMeasureCards: () => set({ openMeasureCardIds: [] }),
			setSelectedConnectedArea: (connectedAreaId) =>
				set({ selectedConnectedAreaId: connectedAreaId }),
			setCurrentStepId: (stepId) => set({ currentStepId: stepId }),
			setUploadError: (error) =>
				set({ uploadError: error, uploadSuccess: null }),
			setUploadSuccess: (success) =>
				set({ uploadSuccess: success, uploadError: null }),
			clearUploadStatus: () => set({ uploadError: null, uploadSuccess: null }),
			setIsDrawing: (isDrawing) => set({ isDrawing }),
			setIsBlockAreaSelecting: (isSelecting) =>
				set({ isBlockAreaSelecting: isSelecting }),
			setIsConnectedAreaSelecting: (isSelecting) =>
				set({ isConnectedAreaSelecting: isSelecting }),
			setIsDrawingNote: (isDrawing) => set({ isDrawingNote: isDrawing }),
			resetDrawInteractions: () =>
				set({
					isDrawing: false,
					isBlockAreaSelecting: false,
					isConnectedAreaSelecting: false,
					isDrawingNote: false,
				}),
			setIsLayerTreeVisible: (isVisible) =>
				set({ isLayerTreeVisible: isVisible }),
			setShowStepper: (show) => set({ showStepper: show }),

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
			setIsSynthesisMode: (isSynthesisMode) => set({ isSynthesisMode }),
			resetModuleState: () =>
				set({
					moduleCurrentSectionId: "heavyRain",
					moduleQuestionIndices: getInitialModuleQuestionIndices(),
					moduleSavedState: null,
					isSynthesisMode: false,
				}),
			setTutorialState: (showTutorial) =>
				set({
					showTutorial,
				}),
			setTutorialOnFirstQuestionState: (showTutorialOnFirstQuestion) =>
				set({
					showTutorialOnFirstQuestion,
				}),
		})),
		{ name: "uiStore" },
	),
);
