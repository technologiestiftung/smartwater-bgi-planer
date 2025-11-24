import Question from "@/components/Modules/HandlungsbedarfeModule/Question";
import {
	steps,
	type SectionId,
} from "@/components/Modules/HandlungsbedarfeModule/constants";
import { useQuestionNavigation } from "@/components/Modules/HandlungsbedarfeModule/hooks/useQuestionNavigation";
import { Spinner } from "@/components/ui/spinner";
import { useAnswersStore } from "@/store/answers";
import { useLayersStore } from "@/store/layers";
import { useCallback, useMemo } from "react";

interface SectionContentProps {
	sectionId: SectionId;
	questionIndices: Record<SectionId, number>;
	setQuestionIndex: (sectionId: SectionId, index: number) => void;
}

export function SectionContent({
	sectionId,
	questionIndices,
	setQuestionIndex,
}: SectionContentProps) {
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const setAnswer = useAnswersStore((state) => state.setAnswer);
	const { navigateToNextQuestion } = useQuestionNavigation(
		questionIndices,
		setQuestionIndex,
	);

	const currentStep = useMemo(
		() => steps.find((step) => step.id === sectionId),
		[sectionId],
	);
	const sectionQuestions = currentStep?.questions || [];
	const currentQuestionIndex = questionIndices[sectionId];
	const currentQuestionId = sectionQuestions[currentQuestionIndex];
	const currentQuestionConfig = useMemo(
		() => layerConfig.find((config) => config.id === currentQuestionId),
		[layerConfig, currentQuestionId],
	);

	const handleAnswer = useCallback(
		(answer: boolean) => {
			setAnswer(currentQuestionId, answer);
			navigateToNextQuestion(sectionId);
		},
		[currentQuestionId, sectionId, setAnswer, navigateToNextQuestion],
	);

	const handleSkip = useCallback(() => {
		setAnswer(currentQuestionId, null);
		navigateToNextQuestion(sectionId);
	}, [currentQuestionId, sectionId, setAnswer, navigateToNextQuestion]);

	if (!currentQuestionConfig) {
		return (
			<div className="h-full">
				<h3 className="text-primary">{currentStep?.title}</h3>
				<Spinner className="mt-6" />
			</div>
		);
	}

	return (
		<div className="h-full">
			<h3 className="text-primary">{currentStep?.title}</h3>
			<Question
				key={currentQuestionConfig.id}
				questionConfig={currentQuestionConfig}
				onAnswer={handleAnswer}
				onSkip={handleSkip}
			/>
		</div>
	);
}
