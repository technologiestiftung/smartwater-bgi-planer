"use client";

import type { StepConfig } from "@/components/VerticalStepper";
import type { SectionId } from "@/lib/helpers/sectionIds";
import { useLayersStore } from "@/store/layers";
import { useUiStore } from "@/store/ui";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

type UseModuleNavigationOptions = {
	steps: StepConfig[];
	useVerticalStepper: () => {
		goToStep: (id: string) => void;
		currentStepId: string | null;
	};
};

export function useModuleNavigation({
	steps,
	useVerticalStepper,
}: UseModuleNavigationOptions) {
	const { goToStep, currentStepId } = useVerticalStepper();

	const {
		resetDrawInteractions,
		moduleQuestionIndices: questionIndices,
		setModuleQuestionIndex: setQuestionIndex,
		saveModuleState: saveCurrentState,
		setIsSynthesisMode,
		setShowStepper,
	} = useUiStore(
		useShallow((state) => ({
			resetDrawInteractions: state.resetDrawInteractions,
			moduleQuestionIndices: state.moduleQuestionIndices,
			setModuleQuestionIndex: state.setModuleQuestionIndex,
			saveModuleState: state.saveModuleState,
			setIsSynthesisMode: state.setIsSynthesisMode,
			setShowStepper: state.setShowStepper,
		})),
	);

	const applyConfigLayers = useLayersStore(
		(state: any) => state.applyConfigLayers,
	);

	const allQuestions = useMemo(
		() =>
			steps.flatMap((step: StepConfig) =>
				(step.questions ?? []).map((configId: string) => ({
					sectionId: step.id as SectionId,
					configId,
				})),
			),
		[steps],
	);

	const getCurrentQuestionInfo = useCallback(() => {
		const currentSectionId = currentStepId as SectionId;
		const currentSectionQuestions =
			steps.find((s: StepConfig) => s.id === currentSectionId)?.questions ?? [];
		const currentQuestionIndex = questionIndices[currentSectionId];
		const currentConfigId = currentSectionQuestions[currentQuestionIndex];
		const globalQuestionIndex = allQuestions.findIndex(
			(q) => q.configId === currentConfigId && q.sectionId === currentSectionId,
		);
		return {
			currentQuestionId: currentConfigId,
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
			(q: string) => q === prevQuestion.configId,
		);
		setQuestionIndex(prevQuestion.sectionId, prevQuestionIndex);
		resetDrawInteractions();
		applyConfigLayers(prevQuestion.configId, true);
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
			(q: string) => q === nextQuestion.configId,
		);
		setQuestionIndex(nextQuestion.sectionId, nextQuestionIndex);
		resetDrawInteractions();
		applyConfigLayers(nextQuestion.configId, true);
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
			const configId = sectionQuestions[questionIndex];
			const globalQuestionIndex = allQuestions.findIndex(
				(q) => q.configId === configId && q.sectionId === fromSectionId,
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
				(q: string) => q === nextQuestion.configId,
			);
			setQuestionIndex(nextQuestion.sectionId, nextQuestionIndex);
			resetDrawInteractions();
			applyConfigLayers(nextQuestion.configId, true);
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

	const navigateToQuestion = useCallback(
		(configId: string, sectionId?: SectionId) => {
			const target = allQuestions.find((q) =>
				sectionId
					? q.configId === configId && q.sectionId === sectionId
					: q.configId === configId,
			);

			if (!target) {
				console.warn("Question not found:", { configId, sectionId });
				return false;
			}

			const targetSectionId = target.sectionId;

			if (targetSectionId !== currentStepId) {
				goToStep(targetSectionId);
			}

			const sectionQuestions =
				steps.find((s: StepConfig) => s.id === targetSectionId)?.questions ??
				[];

			const targetIndex = sectionQuestions.findIndex(
				(q: string) => q === target.configId,
			);

			if (targetIndex === -1) {
				console.warn("Question not found in section:", target);
				return false;
			}

			setQuestionIndex(targetSectionId, targetIndex);

			resetDrawInteractions();
			applyConfigLayers(target.configId, true);

			return true;
		},
		[
			allQuestions,
			currentStepId,
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
		setShowStepper(false);
	}, [questionIndices, saveCurrentState, setIsSynthesisMode, setShowStepper]);

	const handleShowPotentialMaps = useCallback(() => {
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
		setShowStepper(false);
	}, [questionIndices, saveCurrentState, setShowStepper]);

	return {
		questionIndices,
		setQuestionIndex,
		getCurrentQuestionInfo,
		getCurrentSectionInfo,
		navigateToNextQuestion,
		navigateToQuestion,
		navigateToPrevious,
		navigateToNext,
		handleShowSynthesis,
		handleShowPotentialMaps,
		saveModuleState: saveCurrentState,
		restoreModuleState: useUiStore.getState().restoreModuleState,
	};
}
