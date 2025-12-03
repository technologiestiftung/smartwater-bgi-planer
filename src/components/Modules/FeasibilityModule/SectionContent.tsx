import Question from "@/components/Modules/NeedForActionModule/Question";
import { useModuleNavigation } from "@/components/Modules/shared/useModuleNavigation";
import { useVerticalStepper } from "@/components/VerticalStepper";
import { useLayersStore } from "@/store";
import { useAnswersStore } from "@/store/answers";
import { SectionId } from "@/types/sectionIds";
import { useCallback, useMemo } from "react";
import { feasibilitySteps } from "./constants";

interface SectionContentProps {
	sectionId: SectionId;
}

export function SectionContent({ sectionId }: SectionContentProps) {
	const layerConfig = useLayersStore((state: any) => state.layerConfig);
	const setAnswer = useAnswersStore((state: any) => state.setAnswer);
	const { getCurrentSectionInfo, navigateToNextQuestion } = useModuleNavigation(
		{
			steps: feasibilitySteps,
			useVerticalStepper,
		},
	);
	const { currentStep, currentQuestionId } = getCurrentSectionInfo(sectionId);
	const currentQuestionConfig = useMemo(
		() => layerConfig.find((config: any) => config.id === currentQuestionId),
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
		return <div />;
	}
	return (
		<div className="h-full">
			<h3 className="text-primary">{(currentStep as any)?.title}</h3>
			<Question
				key={currentQuestionConfig.id}
				questionConfig={currentQuestionConfig}
				onAnswer={handleAnswer}
				onSkip={handleSkip}
			/>
		</div>
	);
}
