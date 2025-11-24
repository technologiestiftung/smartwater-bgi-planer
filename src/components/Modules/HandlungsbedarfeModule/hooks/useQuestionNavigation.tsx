import { useCallback, useMemo } from "react";
import { useVerticalStepper } from "../../../VerticalStepper";
import { steps, type SectionId } from "../constants";

export function useQuestionNavigation(
	questionIndices: Record<SectionId, number>,
	setQuestionIndex: (sectionId: SectionId, index: number) => void,
) {
	const { goToStep } = useVerticalStepper();

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

	const navigateToNextQuestion = useCallback(
		(currentSectionId: SectionId) => {
			const currentSectionQuestions =
				steps.find((s) => s.id === currentSectionId)?.questions || [];
			const currentQuestionIndex = questionIndices[currentSectionId];
			const currentQuestionId = currentSectionQuestions[currentQuestionIndex];

			const globalQuestionIndex = allQuestions.findIndex(
				(q) =>
					q.questionId === currentQuestionId &&
					q.sectionId === currentSectionId,
			);

			if (globalQuestionIndex === allQuestions.length - 1) {
				return false;
			}

			const nextQuestion = allQuestions[globalQuestionIndex + 1];
			if (nextQuestion.sectionId !== currentSectionId) {
				goToStep(nextQuestion.sectionId);
			}

			const nextSectionQuestions =
				steps.find((s) => s.id === nextQuestion.sectionId)?.questions || [];
			const nextQuestionIndex = nextSectionQuestions.findIndex(
				(q) => q === nextQuestion.questionId,
			);
			setQuestionIndex(nextQuestion.sectionId, nextQuestionIndex);

			return true;
		},
		[questionIndices, allQuestions, goToStep, setQuestionIndex],
	);

	return { navigateToNextQuestion, allQuestions };
}
