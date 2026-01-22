"use client";

import { getModuleSteps } from "@/components/Modules/shared/moduleConfig";
import StepContent from "@/components/Modules/shared/StepContent";
import { useModuleNavigation } from "@/components/Modules/shared/useModuleNavigation";
import { Spinner } from "@/components/ui/spinner";
import { useVerticalStepper } from "@/components/VerticalStepper";
import { useLayersStore } from "@/store";
import { useAnswersStore } from "@/store/answers";
import { SectionId } from "@/types/sectionIds";
import { useCallback, useMemo } from "react";

interface SectionContentProps {
	sectionId: SectionId;
}

export function SectionContent({ sectionId }: SectionContentProps) {
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const setAnswer = useAnswersStore((state) => state.setAnswer);
	const needForActionSteps = getModuleSteps("needForAction");
	const { getCurrentSectionInfo, navigateToNext, handleShowSynthesis } =
		useModuleNavigation({
			steps: needForActionSteps,
			useVerticalStepper,
		});

	const { currentStep, currentQuestionId } = getCurrentSectionInfo(sectionId);

	const currentQuestionConfig = useMemo(
		() => layerConfig.find((config: any) => config.id === currentQuestionId),
		[layerConfig, currentQuestionId],
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
