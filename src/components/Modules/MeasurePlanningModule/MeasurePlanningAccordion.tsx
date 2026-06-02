"use client";

import { MeasurePlanningStepContent } from "@/components/Modules/MeasurePlanningModule/MeasurePlanningStepContent";
import { SynthesisView } from "@/components/Modules/MeasurePlanningModule/SynthesisView";
import {
	getModuleSteps,
	type ModuleStepViewConfig,
} from "@/components/Modules/shared/moduleConfig";
import { SideMenu } from "@/components/SideMenu";
// import { Tutorial } from "@/components/Tutorial/Tutorial";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useLayerFeatures } from "@/hooks/useLayerFeatures";
import { useMapReady } from "@/hooks/useMapReady";
import { getIconComponent } from "@/lib/helpers/iconMap";
import type { SectionId } from "@/lib/helpers/sectionIds";
import { cn } from "@/lib/utils";
import { useLayersStore, useUiStore } from "@/store";
import type { LayerConfigItem } from "@/store/layers/types";
import type { ModuleMeasurementConfig } from "@/types/shared";
import { LAYER_IDS } from "@/types/shared";
import { ArrowLeftIcon, InfoIcon, ListChecksIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

interface StepItem {
	id: string;
	questionId: string;
	infoQuestionId?: string;
	title?: string;
	metricIcons: string[];
}

function toStepItems(step: ModuleStepViewConfig): StepItem[] {
	if (step.measurements) {
		return step.measurements.map((m: ModuleMeasurementConfig) => ({
			id: m.id,
			questionId: m.layerConfigId ?? m.id,
			infoQuestionId: m.infoLayerConfigId,
			title: m.title,
			metricIcons: m.metricIcons ?? [],
		}));
	}
	return (step.questions ?? []).map((qId: string) => ({
		id: qId,
		questionId: qId,
		metricIcons: [],
	}));
}

function getItemLabel(
	item: StepItem,
	configMap: Map<string, LayerConfigItem>,
): string {
	const config = configMap.get(item.questionId);
	return item.title || config?.name || config?.question || item.questionId;
}

function stepRequiresConnectedArea(step: ModuleStepViewConfig): boolean {
	return step.measurements?.some((m) => m.id === "connected_area") ?? false;
}

interface MeasurePlanningAccordionProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
}

function MeasurePlanningFooter({
	onShowSynthesis,
	onBackToQuestions,
	showBackToQuestions,
}: {
	onShowSynthesis: () => void;
	onBackToQuestions: () => void;
	showBackToQuestions: boolean;
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
			{/* <Tutorial type="synthesis" /> */}
			{showBackToQuestions && (
				<Button
					variant="ghost"
					className="flex h-full justify-center rounded-none"
					onClick={onBackToQuestions}
				>
					<ArrowLeftIcon />
					Zurück
				</Button>
			)}
		</div>
	);
}

interface MeasureListItemProps {
	item: StepItem;
	label: string;
	isConnectedArea: boolean;
	isDisabled: boolean;
	hasPlacedMeasure: boolean;
	stepId: string;
	onActivate: (stepId: string, questionId: string) => void;
}

function MeasureListItem({
	item,
	label,
	isConnectedArea,
	isDisabled,
	hasPlacedMeasure,
	stepId,
	onActivate,
}: MeasureListItemProps) {
	return (
		<div className="hover:bg-light flex items-center gap-2">
			<button
				type="button"
				onClick={() => !isDisabled && onActivate(stepId, item.questionId)}
				disabled={isDisabled}
				className={cn(
					"border-muted flex flex-1 items-center justify-between px-3 py-2 text-left transition-colors",
					isConnectedArea &&
						"bg-primary text-primary-foreground hover:bg-primary/90",
					isDisabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
				)}
			>
				<div className="flex items-center gap-2">
					<span className={hasPlacedMeasure ? "font-bold" : "font-medium"}>
						{label}
					</span>
					{item.metricIcons.length > 0 && (
						<div className="flex items-center gap-1">
							{item.metricIcons.map((iconName) => {
								const MetricIcon = getIconComponent(iconName);
								return (
									<span
										key={`${item.id}-${iconName}`}
										className={cn(
											"border-primary inline-flex items-center justify-center rounded-full border p-1",
											isConnectedArea && "border-primary-foreground",
										)}
									>
										<MetricIcon className="h-4 w-4" />
									</span>
								);
							})}
						</div>
					)}
				</div>
			</button>
			{item.infoQuestionId && (
				<button
					type="button"
					onClick={() => onActivate(stepId, item.infoQuestionId!)}
					className="text-primary hover:text-primary/80 inline-flex h-9 w-9 items-center justify-center rounded-full"
					aria-label={`Informationen zu ${label}`}
				>
					<InfoIcon className="h-5 w-5" />
				</button>
			)}
		</div>
	);
}

export function MeasurePlanningAccordion({
	open,
	onOpenChange,
	title,
	description,
}: MeasurePlanningAccordionProps) {
	const steps = getModuleSteps("measurePlanning");
	const { hasFeatures: hasConnectedArea } = useLayerFeatures(
		LAYER_IDS.CONNECTED_AREA_DRAW,
	);
	const placedMeasureIds = useUiStore((state) => state.placedMeasureIds);
	const [expandedStepId, setExpandedStepId] = useState(steps[0]?.id ?? "");
	const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
		null,
	);
	const hasInitializedRef = useRef(false);
	const isMapReady = useMapReady();

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

	const selectedMetricIcons = useMemo(() => {
		if (!selectedQuestionId) return [];
		for (const step of steps) {
			const measurement = step.measurements?.find(
				(m) => (m.layerConfigId ?? m.id) === selectedQuestionId,
			);
			if (measurement?.metricIcons) return measurement.metricIcons;
		}
		return [];
	}, [selectedQuestionId, steps]);

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

	const handleShowSynthesis = useCallback(() => {
		setIsSynthesisMode(true);
	}, [setIsSynthesisMode]);

	const handleBackToQuestions = useCallback(() => {
		setSelectedQuestionId(null);
		setIsSynthesisMode(false);
		resetDrawInteractions();
		applyConfigLayers("measure_start", true);
	}, [setIsSynthesisMode, resetDrawInteractions, applyConfigLayers]);

	const handleBackToSpecificQuestion = useCallback(
		(questionId: string, sectionId: SectionId) => {
			activateQuestion(sectionId, questionId);
			setIsSynthesisMode(false);
		},
		[activateQuestion, setIsSynthesisMode],
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
		applyConfigLayers("measure_start", true);
		hasInitializedRef.current = true;
	}, [open, isMapReady, layerConfig.length, applyConfigLayers]);

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
				<MeasurePlanningStepContent
					layerConfig={selectedQuestionConfig}
					metricIcons={selectedMetricIcons}
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
					{steps.map((step) => {
						const items = toStepItems(step);
						const needsConnectedArea = stepRequiresConnectedArea(step);

						return (
							<AccordionItem
								key={step.id}
								value={step.id}
								className="border-neutral-mid"
							>
								<AccordionTrigger className="text-primary py-5 text-xl font-semibold hover:no-underline">
									<div className="flex items-center gap-3">
										<span>{step.title}</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="pb-5">
									<div className="space-y-1">
										{items.map((item) => {
											const isConnectedArea =
												item.questionId === "connected_area";
											const isDisabled =
												needsConnectedArea &&
												!isConnectedArea &&
												!hasConnectedArea;

											return (
												<MeasureListItem
													key={item.id}
													item={item}
													label={getItemLabel(item, layerConfigById)}
													isConnectedArea={isConnectedArea}
													isDisabled={isDisabled}
													hasPlacedMeasure={placedMeasureIds.has(
														item.questionId,
													)}
													stepId={step.id}
													onActivate={activateQuestion}
												/>
											);
										})}
									</div>
								</AccordionContent>
							</AccordionItem>
						);
					})}
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
					<MeasurePlanningFooter
						onShowSynthesis={handleShowSynthesis}
						onBackToQuestions={handleBackToQuestions}
						showBackToQuestions={Boolean(selectedQuestionConfig)}
					/>
				)
			}
			bodyClassName="p-0"
		>
			{content}
		</SideMenu>
	);
}
