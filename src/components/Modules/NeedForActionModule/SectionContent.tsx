"use client";

import { getModuleSteps } from "@/components/Modules/shared/moduleConfig";
import { StepContent } from "@/components/Modules/shared/StepContent";
import { useModuleNavigation } from "@/components/Modules/shared/useModuleNavigation";
import { Spinner } from "@/components/ui/spinner";
import { useVerticalStepper } from "@/components/VerticalStepper";
import { SectionId } from "@/lib/helpers/sectionIds";
import { useLayersStore } from "@/store";
import { selectLayerConfigById } from "@/store/layers";
import { useAnswersStore } from "@/store/answers";
import { useCallback } from "react";

interface SectionContentProps {
	sectionId: SectionId;
}

export function SectionContent({ sectionId }: SectionContentProps) {
	const setAnswer = useAnswersStore((state) => state.setAnswer);
	const needForActionSteps = getModuleSteps("needForAction");
	const { getCurrentSectionInfo, navigateToNext, handleShowSynthesis } =
		useModuleNavigation({
			steps: needForActionSteps,
			useVerticalStepper,
		});

	const { currentStep, currentQuestionId } = getCurrentSectionInfo(sectionId);
	const currentQuestionConfig = useLayersStore((state) =>
		selectLayerConfigById(state, currentQuestionId),
	);

	const title = currentQuestionConfig?.isIntro
		? currentQuestionConfig?.moduleName
		: currentStep?.title;

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
		return (
			<div className="h-full">
				<h3 className="text-primary">{title}</h3>
				<Spinner className="mt-6" />
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<h3 className="text-primary shrink-0">{title}</h3>
			<StepContent
				layerConfig={currentQuestionConfig}
				onAnswer={handleAnswer}
				onSkip={handleSkip}
			/>
		</div>
	);
}
