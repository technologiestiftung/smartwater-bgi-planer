"use client";

import { SynthesisView } from "@/components/Modules/MeasurePlaningModule/SynthesisView";
import { getModuleSteps } from "@/components/Modules/shared/moduleConfig";
import StepContent from "@/components/Modules/shared/StepContent";
import { SideMenu } from "@/components/SideMenu";
import { Tutorial } from "@/components/Tutorials/Tutorial";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useMapReady } from "@/hooks/useMapReady";
import { SectionId } from "@/lib/helpers/sectionIds";
import { cn } from "@/lib/utils";
import { useLayersStore, useUiStore } from "@/store";
import { useAnswersStore } from "@/store/answers";
import { LayerConfigItem } from "@/store/layers/types";
import {
	ArrowLeftIcon,
	CheckCircleIcon,
	ListChecksIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

interface MeasurePlaningAccordionProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
}

function MeasurePlaningFooter({
	onShowSynthesis,
	onBackToQuestions,
}: {
	onShowSynthesis: () => void;
	onBackToQuestions: () => void;
}) {
	return (
		<div className="border-muted flex h-full w-full border-t">
			<Button
				onClick={onShowSynthesis}
				variant="ghost"
				className="bg-secondary z-101 flex h-full w-18 items-center justify-center rounded-none"
			>
				<ListChecksIcon className="h-6 w-6 text-white" />
			</Button>
			<Tutorial type="synthesis" />
			<Button
				variant="ghost"
				className="flex h-full justify-center rounded-none"
				onClick={onBackToQuestions}
			>
				<ArrowLeftIcon />
				Zurück
			</Button>
		</div>
	);
}

export function MeasurePlaningAccordion({
	open,
	onOpenChange,
	title,
	description,
}: MeasurePlaningAccordionProps) {
	const steps = getModuleSteps("measurePlaning");
	const firstQuestionId = steps[0]?.questions?.[0];
	const [expandedStepId, setExpandedStepId] = useState<string>(
		steps[0]?.id ?? "",
	);
	const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
		null,
	);
	const hasInitializedRef = useRef(false);
	const isMapReady = useMapReady();

	const setAnswer = useAnswersStore((state) => state.setAnswer);
	const answers = useAnswersStore((state) => state.answers);

	const { layerConfig, applyConfigLayers } = useLayersStore(
		useShallow((state) => ({
			layerConfig: state.layerConfig,
			applyConfigLayers: state.applyConfigLayers,
		})),
	);

	const {
		setShowStepper,
		setIsSynthesisMode,
		isSynthesisMode,
		resetDrawInteractions,
	} = useUiStore(
		useShallow((state) => ({
			setShowStepper: state.setShowStepper,
			setIsSynthesisMode: state.setIsSynthesisMode,
			isSynthesisMode: state.isSynthesisMode,
			resetDrawInteractions: state.resetDrawInteractions,
		})),
	);

	const layerConfigById = useMemo(
		() => new Map(layerConfig.map((item) => [item.id, item])),
		[layerConfig],
	);

	const selectedQuestionConfig = useMemo(
		() =>
			selectedQuestionId
				? (layerConfigById.get(selectedQuestionId) ?? null)
				: null,
		[selectedQuestionId, layerConfigById],
	);

	const activateQuestion = useCallback(
		(stepId: string, questionId: string) => {
			setExpandedStepId(stepId);
			setSelectedQuestionId(questionId);
			resetDrawInteractions();
			applyConfigLayers(questionId, true);
		},
		[resetDrawInteractions, applyConfigLayers],
	);

	const handleOpenChange = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen) {
				hasInitializedRef.current = false;
				setSelectedQuestionId(null);
				setIsSynthesisMode(false);
			}
			onOpenChange(nextOpen);
		},
		[onOpenChange, setIsSynthesisMode],
	);

	useEffect(() => {
		setShowStepper(false);
		return () => setShowStepper(true);
	}, [setShowStepper]);

	useEffect(() => {
		if (
			!open ||
			hasInitializedRef.current ||
			!isMapReady ||
			layerConfig.length === 0
		)
			return;
		if (firstQuestionId) {
			applyConfigLayers(firstQuestionId, true);
			hasInitializedRef.current = true;
		}
	}, [
		open,
		isMapReady,
		layerConfig.length,
		firstQuestionId,
		applyConfigLayers,
	]);
	const handleShowSynthesis = useCallback(() => {
		setIsSynthesisMode(true);
	}, [setIsSynthesisMode]);
	const handleBackToQuestions = useCallback(() => {
		setSelectedQuestionId(null);
		setIsSynthesisMode(false);
	}, [setIsSynthesisMode]);

	const handleBackToSpecificQuestion = useCallback(
		(questionId: string, sectionId: SectionId) => {
			activateQuestion(sectionId, questionId);
			setIsSynthesisMode(false);
		},
		[activateQuestion, setIsSynthesisMode],
	);

	const handleQuestionAnswer = useCallback(
		(answer: boolean) => {
			if (!selectedQuestionId) return;
			setAnswer(selectedQuestionId, answer);
		},
		[selectedQuestionId, setAnswer],
	);

	const handleQuestionSkip = useCallback(() => {
		if (!selectedQuestionId) return;
		setAnswer(selectedQuestionId, null);
	}, [selectedQuestionId, setAnswer]);

	let content: React.ReactNode;

	if (isSynthesisMode) {
		content = (
			<SynthesisView
				onBackToQuestions={handleBackToQuestions}
				onBackToSpecificQuestion={handleBackToSpecificQuestion}
			/>
		);
	} else if (selectedQuestionConfig) {
		content = (
			<div className="flex h-full flex-col p-6">
				<h3 className="text-primary shrink-0 text-xl font-semibold">
					{selectedQuestionConfig.name || selectedQuestionId}
				</h3>
				<StepContent
					layerConfig={selectedQuestionConfig as LayerConfigItem}
					onAnswer={handleQuestionAnswer}
					onSkip={handleQuestionSkip}
				/>
			</div>
		);
	} else {
		content = (
			<div className="flex h-full flex-col px-6 pb-6">
				<p className="text-primary mt-2 mb-4">{description}</p>
				<Accordion
					type="single"
					collapsible
					value={expandedStepId}
					onValueChange={(value) => setExpandedStepId(value || "")}
				>
					{steps.map((step) => (
						<AccordionItem key={step.id} value={step.id}>
							<AccordionTrigger className="text-primary py-5 text-2xl font-semibold hover:no-underline">
								<div className="flex items-center gap-3">
									<div className="text-primary [&_svg]:size-6">{step.icon}</div>
									<span>{step.title}</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="pb-5">
								<div className="space-y-2">
									{(step.questions ?? []).map((questionId) => {
										const config = layerConfigById.get(questionId);
										const label =
											config?.name || config?.question || questionId;
										const isAnswered = answers[questionId] !== undefined;
										const isConnectedArea = questionId === "connected_area";

										return (
											<button
												key={questionId}
												type="button"
												onClick={() => activateQuestion(step.id, questionId)}
												className={cn(
													"border-muted hover:border-primary flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors",
													isConnectedArea &&
														"bg-primary text-primary-foreground hover:bg-primary/90",
												)}
											>
												<span className="font-medium">{label}</span>
												{isAnswered && (
													<CheckCircleIcon
														className={cn(
															"h-5 w-5",
															isConnectedArea
																? "text-primary-foreground"
																: "text-primary",
														)}
													/>
												)}
											</button>
										);
									})}
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		);
	}

	return (
		<SideMenu
			open={open}
			onOpenChange={handleOpenChange}
			title={title}
			description={description}
			footer={
				isSynthesisMode ? null : (
					<MeasurePlaningFooter
						onShowSynthesis={handleShowSynthesis}
						onBackToQuestions={handleBackToQuestions}
					/>
				)
			}
			bodyClassName="p-0"
		>
			{content}
		</SideMenu>
	);
}
