import Question from "@/components/Modules/NeedForActionModule/Question";
import { useModuleNavigationGeneric } from "@/components/Modules/shared/useModuleNavigationGeneric";
import { useVerticalStepper } from "@/components/VerticalStepper";
import { useAnswersStore } from "@/store/answers";
import { useCallback, useMemo } from "react";
import type { MeasurePlaningSectionId } from "./constants";

import { useLayersStore } from "@/store/layers";
import { measurePlaningSteps } from "./constants";

interface SectionContentProps {
	sectionId: MeasurePlaningSectionId;
}

export function SectionContent({ sectionId }: SectionContentProps) {
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const setAnswer = useAnswersStore((state) => state.setAnswer);
	const { getCurrentSectionInfo, navigateToNextQuestion } =
		useModuleNavigationGeneric({
			steps: measurePlaningSteps,
			useVerticalStepper,
		});
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
