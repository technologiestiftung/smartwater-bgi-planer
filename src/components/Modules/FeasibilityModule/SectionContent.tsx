"use client";

import { StepContent } from "@/components/Modules/shared/StepContent";
import { getModuleSteps } from "@/components/Modules/shared/moduleConfig";
import { useModuleNavigation } from "@/components/Modules/shared/useModuleNavigation";
import { useVerticalStepper } from "@/components/VerticalStepper";
import { SectionId } from "@/lib/helpers/sectionIds";
import { useLayersStore } from "@/store";
import { useAnswersStore } from "@/store/answers";
import { selectLayerConfigById } from "@/store/layers";
import { useCallback } from "react";

interface SectionContentProps {
	sectionId: SectionId;
	onShowPotentialMaps?: () => void;
}

export function SectionContent({
	sectionId,
	onShowPotentialMaps,
}: SectionContentProps) {
	const setAnswer = useAnswersStore((state: any) => state.setAnswer);
	const feasibilitySteps = getModuleSteps("feasibility");

	const {
		getCurrentSectionInfo,
		navigateToNextQuestion,
		navigateToNext,
		handleShowSynthesis,
	} = useModuleNavigation({
		steps: feasibilitySteps,
		useVerticalStepper,
	});

	const { currentStep, currentQuestionId } = getCurrentSectionInfo(sectionId);
	const currentLayerConfig = useLayersStore((state) =>
		selectLayerConfigById(state, currentQuestionId),
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
		navigateToNextQuestion(sectionId);
	}, [currentQuestionId, sectionId, setAnswer, navigateToNextQuestion]);

	if (!currentLayerConfig) {
		return <div />;
	}

	return (
		<div className="flex h-full flex-col">
			<h3 className="text-primary shrink-0">{(currentStep as any)?.title}</h3>
			<StepContent
				layerConfig={currentLayerConfig}
				onAnswer={handleAnswer}
				onSkip={handleSkip}
				onShowPotentialMaps={onShowPotentialMaps}
			/>
		</div>
	);
}
