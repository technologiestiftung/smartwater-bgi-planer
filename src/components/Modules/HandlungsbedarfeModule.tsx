"use client";

import { SideMenu } from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import {
	StepConfig,
	StepContainer,
	StepContent,
	StepIndicator,
	useVerticalStepper,
	VerticalStepper,
} from "@/components/VerticalStepper";
import { useAnswersStore } from "@/store/answers";
import { useLayersStore } from "@/store/layers";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CloudRainIcon,
	DropIcon,
	FishIcon,
	ListChecksIcon,
	RoadHorizonIcon,
	ThermometerHotIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import Question from "./Question";

interface HandlungsbedarfeModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
}

type SectionId =
	| "heavyRain"
	| "heat"
	| "sealing"
	| "waterBalance"
	| "waterProtection";

const steps: StepConfig[] = [
	{
		id: "heavyRain",
		icon: <CloudRainIcon />,
		title: "Starkregen",
		questions: [
			"heavy_rain_flow_velocity",
			"heavy_rain_water_level",
			"heavy_rain_fire_department_incidents",
		],
	},
	{
		id: "heat",
		icon: <ThermometerHotIcon />,
		title: "Hitze",
		questions: [
			"heat_thermal_load_day",
			"heat_thermal_load_night",
			"heat_vulnerable_areas",
			"heat_cold_air_corridors",
			"heat_air_exchange_corridors",
			"heat_cold_air_flow",
		],
	},
	{
		id: "sealing",
		icon: <RoadHorizonIcon />,
		title: "Versiegelung",
		questions: [
			"sealing_block_areas_high",
			"sealing_green_volume_low",
			"sealing_small_scale_high",
		],
	},
	{
		id: "waterBalance",
		icon: <DropIcon />,
		title: "Wasserhaushalt",
		questions: ["water_balance_natural_deviation"],
	},
	{
		id: "waterProtection",
		icon: <FishIcon />,
		title: "Gewässerschutz",
		questions: [
			"water_protection_sewer_type",
			"water_protection_decoupling_requirements",
			"water_protection_small_waters_demand",
		],
	},
];

const useSectionQuestionState = () => {
	const [questionIndices, setQuestionIndices] = useState<
		Record<SectionId, number>
	>({
		heavyRain: 0,
		heat: 0,
		sealing: 0,
		waterBalance: 0,
		waterProtection: 0,
	});

	const setQuestionIndex = (sectionId: SectionId, index: number) => {
		setQuestionIndices((prev) => ({
			...prev,
			[sectionId]: index,
		}));
	};

	return { questionIndices, setQuestionIndex };
};

function useQuestionNavigation(
	questionIndices: Record<SectionId, number>,
	setQuestionIndex: (sectionId: SectionId, index: number) => void,
) {
	const { goToStep } = useVerticalStepper();

	const allQuestions = steps.flatMap((step) =>
		(step.questions || []).map((questionId) => ({
			sectionId: step.id as SectionId,
			questionId,
		})),
	);

	const navigateToNextQuestion = (currentSectionId: SectionId) => {
		const currentSectionQuestions =
			steps.find((s) => s.id === currentSectionId)?.questions || [];
		const currentQuestionIndex = questionIndices[currentSectionId];
		const currentQuestionId = currentSectionQuestions[currentQuestionIndex];

		const globalQuestionIndex = allQuestions.findIndex(
			(q) =>
				q.questionId === currentQuestionId && q.sectionId === currentSectionId,
		);

		const isLastQuestion = globalQuestionIndex === allQuestions.length - 1;

		if (isLastQuestion) {
			return false;
		}

		const nextQuestion = allQuestions[globalQuestionIndex + 1];
		if (nextQuestion.sectionId !== currentSectionId) {
			goToStep(nextQuestion.sectionId);
		}

		const nextSectionQuestions =
			steps.find((s) => s.id === nextQuestion.sectionId)?.questions || [];
		const nextQuestionIndex = nextSectionQuestions.findIndex(
			(q) => q === nextQuestion.questionId,
		);
		setQuestionIndex(nextQuestion.sectionId, nextQuestionIndex);

		return true;
	};

	return { navigateToNextQuestion };
}

function SectionContent({
	sectionId,
	questionIndices,
	setQuestionIndex,
}: {
	sectionId: SectionId;
	questionIndices: Record<SectionId, number>;
	setQuestionIndex: (sectionId: SectionId, index: number) => void;
}) {
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const { setAnswer } = useAnswersStore();
	const { navigateToNextQuestion } = useQuestionNavigation(
		questionIndices,
		setQuestionIndex,
	);

	const currentStep = steps.find((step) => step.id === sectionId);
	const sectionQuestions = currentStep?.questions || [];
	const currentQuestionIndex = questionIndices[sectionId];
	const currentQuestionId = sectionQuestions[currentQuestionIndex];
	const currentQuestionConfig = layerConfig.find(
		(config) => config.id === currentQuestionId,
	);

	const handleAnswer = (answer: boolean) => {
		setAnswer(currentQuestionId, answer);
		navigateToNextQuestion(sectionId);
	};

	const handleSkip = () => {
		setAnswer(currentQuestionId, null);
		navigateToNextQuestion(sectionId);
	};

	if (!currentQuestionConfig) {
		return (
			<div className="h-full space-y-4">
				<h3 className="text-primary">
					{steps.find((s) => s.id === sectionId)?.title}
				</h3>
				<p className="text-muted-foreground">
					Frage nicht gefunden: {currentQuestionId}
				</p>
			</div>
		);
	}

	return (
		<div className="h-full space-y-4">
			<h3 className="text-primary">
				{steps.find((s) => s.id === sectionId)?.title}
			</h3>

			<Question
				key={currentQuestionConfig.id}
				questionConfig={currentQuestionConfig}
				onAnswer={handleAnswer}
				onSkip={handleSkip}
			/>
		</div>
	);
}

function StepperFooter({
	onClose,
	questionIndices,
	setQuestionIndex,
}: {
	onClose: () => void;
	questionIndices: Record<SectionId, number>;
	setQuestionIndex: (sectionId: SectionId, index: number) => void;
}) {
	const { currentStepId, goToStep } = useVerticalStepper();

	const allQuestions = steps.flatMap((step) =>
		(step.questions || []).map((questionId) => ({
			sectionId: step.id as SectionId,
			questionId,
		})),
	);

	const sectionId = currentStepId as SectionId;
	const currentSectionQuestions =
		steps.find((s) => s.id === sectionId)?.questions || [];
	const currentQuestionIndex = questionIndices[sectionId];
	const currentQuestionId = currentSectionQuestions[currentQuestionIndex];

	const globalQuestionIndex = allQuestions.findIndex(
		(q) => q.questionId === currentQuestionId && q.sectionId === sectionId,
	);

	const canGoPrevious = globalQuestionIndex > 0;
	const isLastQuestion = globalQuestionIndex === allQuestions.length - 1;

	const handlePrevious = () => {
		if (!canGoPrevious) {
			onClose();
			return;
		}

		const prevQuestion = allQuestions[globalQuestionIndex - 1];
		if (prevQuestion.sectionId !== sectionId) {
			goToStep(prevQuestion.sectionId);
		}

		const prevSectionQuestions =
			steps.find((s) => s.id === prevQuestion.sectionId)?.questions || [];
		const prevQuestionIndex = prevSectionQuestions.findIndex(
			(q) => q === prevQuestion.questionId,
		);
		setQuestionIndex(prevQuestion.sectionId, prevQuestionIndex);
	};

	const handleNext = () => {
		if (isLastQuestion) {
			onClose();
			return;
		}

		const nextQuestion = allQuestions[globalQuestionIndex + 1];
		if (nextQuestion.sectionId !== sectionId) {
			goToStep(nextQuestion.sectionId);
		}

		const nextSectionQuestions =
			steps.find((s) => s.id === nextQuestion.sectionId)?.questions || [];
		const nextQuestionIndex = nextSectionQuestions.findIndex(
			(q) => q === nextQuestion.questionId,
		);
		setQuestionIndex(nextQuestion.sectionId, nextQuestionIndex);
	};

	return (
		<div className="border-muted flex h-full w-full border-t">
			<div className="bg-secondary flex w-18 items-center justify-center">
				<ListChecksIcon className="h-6 w-6 text-white" />
			</div>
			<div className="flex w-full items-center justify-between p-2">
				<Button variant="ghost" onClick={handlePrevious}>
					<ArrowLeftIcon />
					{canGoPrevious ? "Zurück" : "Schließen"}
				</Button>
				<Button variant="ghost" onClick={handleNext}>
					{isLastQuestion ? "Abschließen" : "Weiter"}
					<ArrowRightIcon />
				</Button>
			</div>
		</div>
	);
}

export default function HandlungsbedarfeModule({
	open,
	onOpenChange,
}: HandlungsbedarfeModuleProps) {
	const { questionIndices, setQuestionIndex } = useSectionQuestionState();
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);

	// Initialize first question when module opens
	useEffect(() => {
		if (open && layerConfig.length > 0) {
			// Apply the first question's layer config
			const firstQuestionId = steps[0]?.questions?.[0];
			if (firstQuestionId) {
				console.log(
					"[HandlungsbedarfeModule] Initializing first question:",
					firstQuestionId,
				);
				applyConfigLayers(firstQuestionId);
			}
		}
	}, [open, layerConfig.length, applyConfigLayers]);

	return (
		<SideMenu
			open={open}
			onOpenChange={onOpenChange}
			title="Modul 1: Handlungsbedarfe"
			description="Untersuchen Sie Ihr Gebiet auf Handlungsbedarfe"
			footer={null}
			bodyClassName="p-0"
		>
			<VerticalStepper steps={steps} initialStepId="heavyRain">
				<div className="flex h-full w-full flex-col">
					<div className="flex grow pb-4">
						<StepIndicator className="w-20" />
						<StepContainer>
							<StepContent stepId="heavyRain">
								<SectionContent
									sectionId="heavyRain"
									questionIndices={questionIndices}
									setQuestionIndex={setQuestionIndex}
								/>
							</StepContent>

							<StepContent stepId="heat">
								<SectionContent
									sectionId="heat"
									questionIndices={questionIndices}
									setQuestionIndex={setQuestionIndex}
								/>
							</StepContent>

							<StepContent stepId="sealing">
								<SectionContent
									sectionId="sealing"
									questionIndices={questionIndices}
									setQuestionIndex={setQuestionIndex}
								/>
							</StepContent>

							<StepContent stepId="waterBalance">
								<SectionContent
									sectionId="waterBalance"
									questionIndices={questionIndices}
									setQuestionIndex={setQuestionIndex}
								/>
							</StepContent>

							<StepContent stepId="waterProtection">
								<SectionContent
									sectionId="waterProtection"
									questionIndices={questionIndices}
									setQuestionIndex={setQuestionIndex}
								/>
							</StepContent>
						</StepContainer>
					</div>
					<div className="shrink-0">
						<StepperFooter
							onClose={() => onOpenChange(false)}
							questionIndices={questionIndices}
							setQuestionIndex={setQuestionIndex}
						/>
					</div>
				</div>
			</VerticalStepper>
		</SideMenu>
	);
}
