import {
	steps,
	type SectionId,
} from "@/components/Modules/HandlungsbedarfeModule/constants";
import { useVerticalStepper } from "@/components/VerticalStepper";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ListChecksIcon,
} from "@phosphor-icons/react";
import { useCallback, useMemo } from "react";
import { Button } from "../../ui/button";

interface StepperFooterProps {
	onClose: () => void;
	questionIndices: Record<SectionId, number>;
	setQuestionIndex: (sectionId: SectionId, index: number) => void;
	onShowSynthesis: () => void;
}

export function StepperFooter({
	onClose,
	questionIndices,
	setQuestionIndex,
	onShowSynthesis,
}: StepperFooterProps) {
	const { currentStepId, goToStep } = useVerticalStepper();

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

	const sectionId = currentStepId as SectionId;
	const currentSectionQuestions =
		steps.find((s) => s.id === sectionId)?.questions || [];
	const currentQuestionIndex = questionIndices[sectionId];
	const currentQuestionId = currentSectionQuestions[currentQuestionIndex];

	const globalQuestionIndex = allQuestions.findIndex(
		(q) => q.questionId === currentQuestionId && q.sectionId === sectionId,
	);

	const canGoPrevious = globalQuestionIndex > 0;
	const isLastQuestion = globalQuestionIndex === allQuestions.length - 1;

	const handlePrevious = useCallback(() => {
		if (!canGoPrevious) {
			onClose();
			return;
		}

		const prevQuestion = allQuestions[globalQuestionIndex - 1];
		if (prevQuestion.sectionId !== sectionId) {
			goToStep(prevQuestion.sectionId);
		}

		const prevSectionQuestions =
			steps.find((s) => s.id === prevQuestion.sectionId)?.questions || [];
		const prevQuestionIndex = prevSectionQuestions.findIndex(
			(q) => q === prevQuestion.questionId,
		);
		setQuestionIndex(prevQuestion.sectionId, prevQuestionIndex);
	}, [
		canGoPrevious,
		onClose,
		allQuestions,
		globalQuestionIndex,
		sectionId,
		goToStep,
		setQuestionIndex,
	]);

	const handleNext = useCallback(() => {
		if (isLastQuestion) {
			onShowSynthesis();
			return;
		}

		const nextQuestion = allQuestions[globalQuestionIndex + 1];
		if (nextQuestion.sectionId !== sectionId) {
			goToStep(nextQuestion.sectionId);
		}

		const nextSectionQuestions =
			steps.find((s) => s.id === nextQuestion.sectionId)?.questions || [];
		const nextQuestionIndex = nextSectionQuestions.findIndex(
			(q) => q === nextQuestion.questionId,
		);
		setQuestionIndex(nextQuestion.sectionId, nextQuestionIndex);
	}, [
		isLastQuestion,
		onShowSynthesis,
		allQuestions,
		globalQuestionIndex,
		sectionId,
		goToStep,
		setQuestionIndex,
	]);

	return (
		<div className="border-muted flex h-full w-full border-t">
			<div className="bg-secondary flex w-18 items-center justify-center">
				<ListChecksIcon className="h-6 w-6 text-white" />
			</div>
			<div className="flex w-full items-center justify-between p-2">
				<Button variant="ghost" onClick={handlePrevious}>
					<ArrowLeftIcon />
					{canGoPrevious ? "Zurück" : "Schließen"}
				</Button>
				<Button variant="ghost" onClick={handleNext}>
					{isLastQuestion ? "Abschließen" : "Weiter"}
					<ArrowRightIcon />
				</Button>
			</div>
		</div>
	);
}
