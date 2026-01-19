"use client";

import StepContent from "@/components/Modules/shared/StepContent";
import { getModuleSteps } from "@/components/Modules/shared/moduleConfig";
import { useModuleNavigation } from "@/components/Modules/shared/useModuleNavigation";
import { useVerticalStepper } from "@/components/VerticalStepper";
import { useAnswersStore } from "@/store/answers";
import { useLayersStore } from "@/store/layers";
import { SectionId } from "@/types/sectionIds";
import { useCallback, useMemo } from "react";

interface SectionContentProps {
	sectionId: SectionId;
}

export function SectionContent({ sectionId }: SectionContentProps) {
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const setAnswer = useAnswersStore((state) => state.setAnswer);
	const measurePlaningSteps = getModuleSteps("measurePlaning");
	const { getCurrentSectionInfo, navigateToNext, handleShowSynthesis } =
		useModuleNavigation({
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
			const success = navigateToNext();
			if (!success) {
				handleShowSynthesis();
			}
		},
		[currentQuestionId, setAnswer, navigateToNext, handleShowSynthesis],
	);

	const handleSkip = useCallback(() => {
		setAnswer(currentQuestionId, null);
		const success = navigateToNext();
		if (!success) {
			handleShowSynthesis();
		}
	}, [currentQuestionId, setAnswer, navigateToNext, handleShowSynthesis]);
	if (!currentQuestionConfig) {
		return <div />;
	}
	return (
		<div className="h-full">
			<h3 className="text-primary">{(currentStep as any)?.title}</h3>
			<StepContent
				layerConfig={currentQuestionConfig}
				onAnswer={handleAnswer}
				onSkip={handleSkip}
			/>
		</div>
	);
}
