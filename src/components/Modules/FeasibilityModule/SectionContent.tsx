"use client";

import Question from "@/components/Modules/shared/Question";
import { getModuleSteps } from "@/components/Modules/shared/moduleConfig";
import { useModuleNavigation } from "@/components/Modules/shared/useModuleNavigation";
import { useVerticalStepper } from "@/components/VerticalStepper";
import { useLayersStore } from "@/store";
import { useAnswersStore } from "@/store/answers";
import { SectionId } from "@/types/sectionIds";
import { useCallback, useMemo } from "react";

interface SectionContentProps {
	sectionId: SectionId;
	onShowPotentialMaps?: () => void;
}

export function SectionContent({
	sectionId,
	onShowPotentialMaps,
}: SectionContentProps) {
	const layerConfig = useLayersStore((state: any) => state.layerConfig);
	const setAnswer = useAnswersStore((state: any) => state.setAnswer);
	const feasibilitySteps = getModuleSteps("feasibility");

	const {
		getCurrentSectionInfo,
		navigateToNextQuestion,
		handleShowPotentialMaps,
	} = useModuleNavigation({
		steps: feasibilitySteps,
		useVerticalStepper,
	});

	const { currentStep, currentQuestionId } = getCurrentSectionInfo(sectionId);
	const currentQuestionConfig = useMemo(
		() => layerConfig.find((config: any) => config.id === currentQuestionId),
		[layerConfig, currentQuestionId],
	);

	const handleAnswer = useCallback(
		(answer: boolean) => {
			if (currentQuestionId === "feasibility_module_introduction") {
				if (onShowPotentialMaps) {
					onShowPotentialMaps();
				} else {
					handleShowPotentialMaps();
				}
				return;
			}

			setAnswer(currentQuestionId, answer);
			navigateToNextQuestion(sectionId);
		},
		[
			currentQuestionId,
			sectionId,
			setAnswer,
			navigateToNextQuestion,
			onShowPotentialMaps,
			handleShowPotentialMaps,
		],
	);

	const handleSkip = useCallback(() => {
		setAnswer(currentQuestionId, null);
		navigateToNextQuestion(sectionId);
	}, [currentQuestionId, sectionId, setAnswer, navigateToNextQuestion]);

	if (!currentQuestionConfig) {
		return <div />;
	}

	return (
		<div className="flex h-full flex-col">
			<h3 className="text-primary shrink-0">{(currentStep as any)?.title}</h3>
			<Question
				key={currentQuestionConfig.id}
				questionConfig={currentQuestionConfig}
				onAnswer={handleAnswer}
				onSkip={handleSkip}
			/>
		</div>
	);
}
