"use client";

import { MeasurePlanningStepContent } from "@/components/Modules/MeasurePlanningModule/MeasurePlanningStepContent";
import { SynthesisView } from "@/components/Modules/MeasurePlanningModule/SynthesisView";
import {
	getModuleSteps,
	type ModuleStepViewConfig,
} from "@/components/Modules/shared/moduleConfig";
import { SideMenu } from "@/components/SideMenu";
import { Tutorial } from "@/components/Tutorial/Tutorial";
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
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { MeasureCatalogModal } from "../MeasureCatalogModule/MeasureCatalogModal";
import { ClimateSimulation } from "@/components/Simulations/ClimateSimulation";
import { ClimateSimulationModal } from "@/components/Simulations/ClimateSimulationModal";

interface StepItem {
	id: string;
	configId: string;
	infoConfigId?: string;
	title?: string;
	metricIcons: string[];
}

function toStepItems(step: ModuleStepViewConfig): StepItem[] {
	if (step.measurements) {
		return step.measurements.map((m: ModuleMeasurementConfig) => ({
			id: m.id,
			configId: m.layerConfigId ?? m.id,
			infoConfigId: `${m.layerConfigId ?? m.id}_info`,
			title: m.title,
			metricIcons: m.metricIcons ?? [],
		}));
	}
	return (step.questions ?? []).map((qId: string) => ({
		id: qId,
		configId: qId,
		metricIcons: [],
	}));
}

function getItemLabel(
	item: StepItem,
	configMap: Map<string, LayerConfigItem>,
): string {
	const config = configMap.get(item.configId);
	return item.title || config?.name || config?.question || item.configId;
}

function stepRequiresConnectedArea(step: ModuleStepViewConfig): boolean {
	return step.measurements?.some((m) => m.id === "connected_area") ?? false;
}

interface MeasurePlanningAccordionProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	info?: string;
	climateSimulation?: string;
	floodRisk?: string;
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
		<div className="MeasurePlanningFooter-root border-muted flex h-full w-full border-t">
			<Button
				onClick={onShowSynthesis}
				variant="ghost"
				className="bg-secondary z-101 flex h-full w-18 items-center justify-center rounded-none"
			>
				<ListChecksIcon className="h-6 w-6 text-white" />
			</Button>
			<Tutorial type="synthesis" />
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
	onActivate: (stepId: string, configId: string) => void;
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
				onClick={() => !isDisabled && onActivate(stepId, item.configId)}
				disabled={isDisabled}
				className={cn(
					"border-muted flex flex-1 cursor-pointer items-center justify-between px-3 py-2 text-left transition-colors",
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
			{item.infoConfigId && (
				<Link
					href={`?info=${item.id}`}
					className="text-primary hover:text-primary/80 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full"
					aria-label={`Informationen zu ${label}`}
				>
					<InfoIcon className="MeasuresInfosIcon h-5 w-5" />
				</Link>
			)}
		</div>
	);
}

export function MeasurePlanningAccordion({
	open,
	onOpenChange,
	title,
	description,
	info,
	climateSimulation,
	floodRisk,
}: MeasurePlanningAccordionProps) {
	const steps = getModuleSteps("measurePlanning");
	const { hasFeatures: hasConnectedArea } = useLayerFeatures(
		LAYER_IDS.CONNECTED_AREA_DRAW,
	);
	const placedMeasureIds = useUiStore((state) => state.placedMeasureIds);
	const [expandedStepId, setExpandedStepId] = useState(steps[0]?.id ?? "");
	const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
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
			selectedConfigId ? (layerConfigById.get(selectedConfigId) ?? null) : null,
		[selectedConfigId, layerConfigById],
	);

	const selectedMetricIcons = useMemo(() => {
		if (!selectedConfigId) return [];
		for (const step of steps) {
			const measurement = step.measurements?.find(
				(m) => (m.layerConfigId ?? m.id) === selectedConfigId,
			);
			if (measurement?.metricIcons) return measurement.metricIcons;
		}
		return [];
	}, [selectedConfigId, steps]);

	const selectedMeasurementInfo = useMemo(() => {
		if (!selectedConfigId) return null;
		for (const step of steps) {
			const measurement = step.measurements?.find(
				(m) => (m.layerConfigId ?? m.id) === selectedConfigId,
			);
			if (measurement) return measurement;
		}
		return null;
	}, [selectedConfigId, steps]);

	const activateQuestion = useCallback(
		(stepId: string, configId: string) => {
			setExpandedStepId(stepId);
			setSelectedConfigId(configId);
			resetDrawInteractions();
			applyConfigLayers(configId, true);
		},
		[resetDrawInteractions, applyConfigLayers],
	);

	const handleOpenChange = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen) {
				hasInitializedRef.current = false;
				setSelectedConfigId(null);
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
		setSelectedConfigId(null);
		setIsSynthesisMode(false);
		resetDrawInteractions();
		applyConfigLayers("measure_start", true);
	}, [setIsSynthesisMode, resetDrawInteractions, applyConfigLayers]);

	const handleBackToSpecificQuestion = useCallback(
		(configId: string, sectionId: SectionId) => {
			activateQuestion(sectionId, configId);
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
	} else if (selectedQuestionConfig && selectedMeasurementInfo) {
		content = (
			<div className="flex h-full flex-col p-6">
				<h3 className="text-primary shrink-0 text-xl font-semibold">
					{selectedMeasurementInfo.title}
				</h3>
				<MeasurePlanningStepContent
					layerConfig={{
						...selectedQuestionConfig,
						name: selectedMeasurementInfo.title ?? selectedQuestionConfig.name,
						description: selectedMeasurementInfo.info?.description,
						subDescription: selectedMeasurementInfo.info?.subDescription,
					}}
					metricIcons={selectedMetricIcons}
					onConfirm={handleBackToQuestions}
				/>
			</div>
		);
	} else if (climateSimulation) {
		content = (
			<>
				<ClimateSimulation
					climateSimulation={climateSimulation}
					onActivate={activateQuestion}
				/>
				<ClimateSimulationModal climateSimulation={climateSimulation} />
			</>
		);
	} else if (floodRisk) {
		content = (
			<>
				<h1>Modelierung Überflutungsgefährdung</h1>
			</>
		);
	} else {
		content = (
			<>
				{info && (
					<MeasureCatalogModal info={info} onActivate={activateQuestion} />
				)}
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
													item.configId === "connected_area";
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
															item.configId,
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

					{/* <Accordion type="multiple">
					<AccordionItem value="legend" className="border-neutral-mid px-4">
						<AccordionTrigger className="text-primary font-bold hover:no-underline">
							Legende
						</AccordionTrigger>
						<AccordionContent className="pb-4"> */}
					<div className="mt-auto pt-6">
						<Image
							src={"/legends/measures.svg"}
							alt="Legende für Maßnahmen"
							width={620}
							height={260}
							className="h-auto max-w-full"
						/>
					</div>
					{/* </AccordionContent>
					</AccordionItem>
				</Accordion> */}
				</div>
			</>
		);
	}

	return (
		<SideMenu
			open={open}
			onOpenChange={handleOpenChange}
			title={title}
			description={description}
			footer={
				isSynthesisMode || climateSimulation ? null : (
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
