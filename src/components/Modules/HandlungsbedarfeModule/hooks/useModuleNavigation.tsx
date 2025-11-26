import {
	steps,
	type SectionId,
} from "@/components/Modules/HandlungsbedarfeModule/constants";
import { useVerticalStepper } from "@/components/VerticalStepper";
import { useUiStore } from "@/store/ui";
import { useCallback, useMemo } from "react";

export function useModuleNavigation() {
	const { goToStep, currentStepId } = useVerticalStepper();
	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);

	const questionIndices = useUiStore((state) => state.moduleQuestionIndices);
	const setQuestionIndex = useUiStore((state) => state.setModuleQuestionIndex);
	const saveCurrentState = useUiStore((state) => state.saveModuleState);
	const setIsSynthesisMode = useUiStore((state) => state.setIsSynthesisMode);

	const allQuestions = useMemo(
		() =>
			steps.flatMap((step) =>
				(step.questions || []).map((questionId) => ({
					sectionId: step.id as SectionId,
					questionId,
				})),
			),
		[],
	);

	const getCurrentQuestionInfo = useCallback(() => {
		const currentSectionId = currentStepId as SectionId;
		const currentSectionQuestions =
			steps.find((s) => s.id === currentSectionId)?.questions || [];
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
	}, [currentStepId, questionIndices, allQuestions]);

	const getCurrentSectionInfo = useCallback(
		(sectionId: SectionId) => {
			const currentStep = steps.find((step) => step.id === sectionId);
			const sectionQuestions = currentStep?.questions || [];
			const currentQuestionIndex = questionIndices[sectionId];
			const currentQuestionId = sectionQuestions[currentQuestionIndex];

			return {
				currentStep,
				sectionQuestions,
				currentQuestionIndex,
				currentQuestionId,
			};
		},
		[questionIndices],
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
			steps.find((s) => s.id === prevQuestion.sectionId)?.questions || [];
		const prevQuestionIndex = prevSectionQuestions.findIndex(
			(q) => q === prevQuestion.questionId,
		);
		setQuestionIndex(prevQuestion.sectionId, prevQuestionIndex);
		resetDrawInteractions();

		return true;
	}, [
		getCurrentQuestionInfo,
		allQuestions,
		currentStepId,
		goToStep,
		setQuestionIndex,
		resetDrawInteractions,
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
			steps.find((s) => s.id === nextQuestion.sectionId)?.questions || [];
		const nextQuestionIndex = nextSectionQuestions.findIndex(
			(q) => q === nextQuestion.questionId,
		);
		setQuestionIndex(nextQuestion.sectionId, nextQuestionIndex);
		resetDrawInteractions();

		return true;
	}, [
		getCurrentQuestionInfo,
		allQuestions,
		currentStepId,
		goToStep,
		setQuestionIndex,
		resetDrawInteractions,
	]);

	// Simplified version for auto-navigation after answering questions
	const navigateToNextQuestion = useCallback(
		(fromSectionId: SectionId) => {
			const sectionQuestions =
				steps.find((s) => s.id === fromSectionId)?.questions || [];
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
				steps.find((s) => s.id === nextQuestion.sectionId)?.questions || [];
			const nextQuestionIndex = nextSectionQuestions.findIndex(
				(q) => q === nextQuestion.questionId,
			);
			setQuestionIndex(nextQuestion.sectionId, nextQuestionIndex);
			resetDrawInteractions();

			return true;
		},
		[
			questionIndices,
			allQuestions,
			goToStep,
			setQuestionIndex,
			resetDrawInteractions,
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
	}, [questionIndices, saveCurrentState, setIsSynthesisMode]);

	return {
		questionIndices,
		setQuestionIndex,
		getCurrentQuestionInfo,
		getCurrentSectionInfo,
		navigateToNextQuestion,
		navigateToPrevious,
		navigateToNext,
		handleShowSynthesis,
	};
}
