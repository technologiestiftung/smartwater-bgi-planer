import type { StepConfig } from "@/components/VerticalStepper";
import type { SectionId } from "@/store/ui/types";
import { useCallback, useMemo } from "react";

type UseModuleNavigationGenericOptions = {
	steps: StepConfig[];
	useVerticalStepper: () => {
		goToStep: (id: string) => void;
		currentStepId: string | null;
	};
	useUiStore: any;
	useLayersStore: any;
};

export function useModuleNavigationGeneric({
	steps,
	useVerticalStepper,
	useUiStore,
	useLayersStore,
}: UseModuleNavigationGenericOptions) {
	const { goToStep, currentStepId } = useVerticalStepper();
	const resetDrawInteractions = useUiStore(
		(state: any) => state.resetDrawInteractions,
	);
	const applyConfigLayers = useLayersStore(
		(state: any) => state.applyConfigLayers,
	);
	const questionIndices = useUiStore(
		(state: any) => state.moduleQuestionIndices,
	);
	const setQuestionIndex = useUiStore(
		(state: any) => state.setModuleQuestionIndex,
	);
	const saveCurrentState = useUiStore((state: any) => state.saveModuleState);
	const setIsSynthesisMode = useUiStore(
		(state: any) => state.setIsSynthesisMode,
	);

	const allQuestions = useMemo(
		() =>
			steps.flatMap((step: StepConfig) =>
				(step.questions ?? []).map((questionId: string) => ({
					sectionId: step.id as SectionId,
					questionId,
				})),
			),
		[steps],
	);

	const getCurrentQuestionInfo = useCallback(() => {
		const currentSectionId = currentStepId as SectionId;
		const currentSectionQuestions =
			steps.find((s: StepConfig) => s.id === currentSectionId)?.questions ?? [];
		const currentQuestionIndex = questionIndices[currentSectionId];
		const currentQuestionId = currentSectionQuestions[currentQuestionIndex];
		const globalQuestionIndex = allQuestions.findIndex(
			(q) =>
				q.questionId === currentQuestionId && q.sectionId === currentSectionId,
		);
		return {
			currentQuestionId,
			globalQuestionIndex,
			isFirstQuestion: globalQuestionIndex === 0,
			isLastQuestion: globalQuestionIndex === allQuestions.length - 1,
		};
	}, [currentStepId, questionIndices, allQuestions, steps]);

	const getCurrentSectionInfo = useCallback(
		(sectionId: SectionId) => {
			const currentStep = steps.find(
				(step: StepConfig) => step.id === sectionId,
			);
			const sectionQuestions = currentStep?.questions ?? [];
			const currentQuestionIndex = questionIndices[sectionId];
			const currentQuestionId = sectionQuestions[currentQuestionIndex];
			return {
				currentStep,
				sectionQuestions,
				currentQuestionIndex,
				currentQuestionId,
			};
		},
		[questionIndices, steps],
	);

	const navigateToPrevious = useCallback(() => {
		const { globalQuestionIndex } = getCurrentQuestionInfo();
		if (globalQuestionIndex <= 0) return false;
		const prevQuestion = allQuestions[globalQuestionIndex - 1];
		const currentSectionId = currentStepId as SectionId;
		if (prevQuestion.sectionId !== currentSectionId) {
			goToStep(prevQuestion.sectionId);
		}
		const prevSectionQuestions =
			steps.find((s: StepConfig) => s.id === prevQuestion.sectionId)
				?.questions ?? [];
		const prevQuestionIndex = prevSectionQuestions.findIndex(
			(q: string) => q === prevQuestion.questionId,
		);
		setQuestionIndex(prevQuestion.sectionId, prevQuestionIndex);
		resetDrawInteractions();
		applyConfigLayers(prevQuestion.questionId, true);
		return true;
	}, [
		getCurrentQuestionInfo,
		allQuestions,
		currentStepId,
		goToStep,
		setQuestionIndex,
		resetDrawInteractions,
		applyConfigLayers,
		steps,
	]);

	const navigateToNext = useCallback(() => {
		const { globalQuestionIndex, isLastQuestion } = getCurrentQuestionInfo();
		if (isLastQuestion) return false;
		const nextQuestion = allQuestions[globalQuestionIndex + 1];
		const currentSectionId = currentStepId as SectionId;
		if (nextQuestion.sectionId !== currentSectionId) {
			goToStep(nextQuestion.sectionId);
		}
		const nextSectionQuestions =
			steps.find((s: StepConfig) => s.id === nextQuestion.sectionId)
				?.questions ?? [];
		const nextQuestionIndex = nextSectionQuestions.findIndex(
			(q: string) => q === nextQuestion.questionId,
		);
		setQuestionIndex(nextQuestion.sectionId, nextQuestionIndex);
		resetDrawInteractions();
		applyConfigLayers(nextQuestion.questionId, true);
		return true;
	}, [
		getCurrentQuestionInfo,
		allQuestions,
		currentStepId,
		goToStep,
		setQuestionIndex,
		resetDrawInteractions,
		applyConfigLayers,
		steps,
	]);

	const navigateToNextQuestion = useCallback(
		(fromSectionId: SectionId) => {
			const sectionQuestions =
				steps.find((s: StepConfig) => s.id === fromSectionId)?.questions ?? [];
			const questionIndex = questionIndices[fromSectionId];
			const questionId = sectionQuestions[questionIndex];
			const globalQuestionIndex = allQuestions.findIndex(
				(q) => q.questionId === questionId && q.sectionId === fromSectionId,
			);
			if (globalQuestionIndex === allQuestions.length - 1) {
				return false;
			}
			const nextQuestion = allQuestions[globalQuestionIndex + 1];
			if (nextQuestion.sectionId !== fromSectionId) {
				goToStep(nextQuestion.sectionId);
			}
			const nextSectionQuestions =
				steps.find((s: StepConfig) => s.id === nextQuestion.sectionId)
					?.questions ?? [];
			const nextQuestionIndex = nextSectionQuestions.findIndex(
				(q: string) => q === nextQuestion.questionId,
			);
			setQuestionIndex(nextQuestion.sectionId, nextQuestionIndex);
			resetDrawInteractions();
			applyConfigLayers(nextQuestion.questionId, true);
			return true;
		},
		[
			questionIndices,
			allQuestions,
			goToStep,
			setQuestionIndex,
			resetDrawInteractions,
			applyConfigLayers,
			steps,
		],
	);

	const handleShowSynthesis = useCallback(() => {
		const stepId = useUiStore.getState().currentStepId;
		if (stepId) {
			useUiStore
				.getState()
				.navigateToModuleQuestion(
					stepId as SectionId,
					questionIndices[stepId as SectionId],
				);
		}
		saveCurrentState();
		setIsSynthesisMode(true);
	}, [questionIndices, saveCurrentState, setIsSynthesisMode, useUiStore]);

	return {
		questionIndices,
		setQuestionIndex,
		getCurrentQuestionInfo,
		getCurrentSectionInfo,
		navigateToNextQuestion,
		navigateToPrevious,
		navigateToNext,
		handleShowSynthesis,
		saveModuleState: saveCurrentState,
		restoreModuleState: useUiStore.getState().restoreModuleState,
	};
}
