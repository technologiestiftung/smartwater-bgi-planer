import Question from "@/components/Modules/NeedForActionModule/Question";
import { useModuleNavigationGeneric } from "@/components/Modules/shared/useModuleNavigationGeneric";
import { useVerticalStepper } from "@/components/VerticalStepper";
import { useAnswersStore } from "@/store/answers";
import { useCallback, useMemo } from "react";
import type { MeasurePlaningSectionId } from "./constants";

import { measurePlaningSteps } from "./constants";

interface SectionContentProps {
	sectionId: MeasurePlaningSectionId;
	useUiStore: any;
	useLayersStore: any;
}

export function SectionContent({
	sectionId,
	useUiStore,
	useLayersStore,
}: SectionContentProps) {
	const layerConfig = useLayersStore((state: any) => state.layerConfig);
	const setAnswer = useAnswersStore((state) => state.setAnswer);
	const { getCurrentSectionInfo, navigateToNextQuestion } =
		useModuleNavigationGeneric({
			steps: measurePlaningSteps,
			useVerticalStepper,
			useUiStore,
			useLayersStore,
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
