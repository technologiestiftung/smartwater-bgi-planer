import {
	steps,
	type SectionId,
} from "@/components/Modules/NeedForActionModule/constants";
import Question from "@/components/Modules/NeedForActionModule/Question";
import { useModuleNavigationGeneric } from "@/components/Modules/shared/useModuleNavigationGeneric";
import { Spinner } from "@/components/ui/spinner";
import { useVerticalStepper } from "@/components/VerticalStepper";
import { useAnswersStore } from "@/store/answers";
import { useCallback, useMemo } from "react";

interface SectionContentProps {
	sectionId: SectionId;
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
	const { navigateToNextQuestion, getCurrentSectionInfo } =
		useModuleNavigationGeneric({
			steps,
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
