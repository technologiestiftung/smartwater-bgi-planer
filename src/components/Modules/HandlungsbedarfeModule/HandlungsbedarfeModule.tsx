"use client";

import {
	steps,
	type SectionId,
} from "@/components/Modules/HandlungsbedarfeModule/constants";
import { SectionContent } from "@/components/Modules/HandlungsbedarfeModule/SectionContent";
import { StepperFooter } from "@/components/Modules/HandlungsbedarfeModule/StepperFooter";
import { SynthesisView } from "@/components/Modules/HandlungsbedarfeModule/SynthesisView";
import { SideMenu } from "@/components/SideMenu";
import {
	StepContainer,
	StepContent,
	StepIndicator,
	VerticalStepper,
	useVerticalStepper,
} from "@/components/VerticalStepper";
import { useLayerFeatures } from "@/hooks/use-layer-features";
import { useMapReady } from "@/hooks/use-map-ready";
import { useLayersStore } from "@/store/layers";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import { useCallback, useEffect, useRef, useState } from "react";

interface HandlungsbedarfeModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
}

function QuestionsContent({
	onClose,
	onShowSynthesis,
}: {
	onClose: () => void;
	onShowSynthesis: () => void;
}) {
	const { setStepValidation, currentStepId } = useVerticalStepper();
	const questionIndices = useUiStore((state) => state.moduleQuestionIndices);
	const { hasFeatures: hasProjectBoundary } = useLayerFeatures(
		LAYER_IDS.PROJECT_BOUNDARY,
	);
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);

	useEffect(() => {
		const currentQuestionIndex = questionIndices.heavyRain;
		const heavyRainQuestions = steps.find(
			(s) => s.id === "heavyRain",
		)?.questions;
		const currentQuestionId = heavyRainQuestions?.[currentQuestionIndex];
		const isOnStarterQuestion = currentQuestionId === "starter_question";

		setStepValidation("heavyRain", () => {
			return !isOnStarterQuestion || hasProjectBoundary;
		});
	}, [setStepValidation, questionIndices, hasProjectBoundary]);

	useEffect(() => {
		if (!currentStepId) return;

		const sectionId = currentStepId as SectionId;
		const currentQuestionIndex = questionIndices[sectionId];
		const sectionQuestions = steps.find((s) => s.id === sectionId)?.questions;
		const questionId = sectionQuestions?.[currentQuestionIndex];

		if (questionId) {
			applyConfigLayers(questionId, true);
		}
	}, [currentStepId, questionIndices, applyConfigLayers]);

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex min-h-0 flex-1 pb-4">
				<StepIndicator className="w-20" />
				<StepContainer className="overflow-y-auto">
					{steps.map((step) => (
						<StepContent key={step.id} stepId={step.id}>
							<SectionContent sectionId={step.id as SectionId} />
						</StepContent>
					))}
				</StepContainer>
			</div>
			<div className="shrink-0">
				<StepperFooter onClose={onClose} onShowSynthesis={onShowSynthesis} />
			</div>
		</div>
	);
}

export default function HandlungsbedarfeModule({
	open,
	onOpenChange,
}: HandlungsbedarfeModuleProps) {
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);

	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);
	const questionIndices = useUiStore((state) => state.moduleQuestionIndices);
	const saveModuleState = useUiStore((state) => state.saveModuleState);
	const restoreModuleState = useUiStore((state) => state.restoreModuleState);
	const setIsSynthesisMode = useUiStore((state) => state.setIsSynthesisMode);
	const isSynthesisMode = useUiStore((state) => state.isSynthesisMode);

	const isMapReady = useMapReady();
	const [stepperKey, setStepperKey] = useState(0);
	const [initialStepId, setInitialStepId] = useState<SectionId>("heavyRain");
	const hasInitializedRef = useRef(false);

	useEffect(() => {
		if (
			open &&
			layerConfig.length > 0 &&
			isMapReady &&
			!hasInitializedRef.current
		) {
			const firstQuestionId = steps[0]?.questions?.[0];
			if (firstQuestionId) {
				applyConfigLayers(firstQuestionId, true);
				hasInitializedRef.current = true;
			} else {
				console.warn("[HandlungsbedarfeModule] firstQuestionId is undefined!");
			}
		}
	}, [open, layerConfig.length, applyConfigLayers, isMapReady]);

	useEffect(() => {
		if (!open) {
			hasInitializedRef.current = false;
		}
	}, [open]);

	useEffect(() => {
		resetDrawInteractions();
	}, [questionIndices, resetDrawInteractions]);

	const onBackToQuestions = useCallback(() => {
		resetDrawInteractions();
		const savedState = restoreModuleState();

		if (savedState) {
			setInitialStepId(savedState.sectionId);
			const currentSection = steps.find((s) => s.id === savedState.sectionId);
			const currentQuestionIndex =
				savedState.questionIndices[savedState.sectionId];
			const currentQuestionId =
				currentSection?.questions?.[currentQuestionIndex];

			if (currentQuestionId) {
				applyConfigLayers(currentQuestionId, true);
			}
		} else {
			setInitialStepId("heavyRain");
			const firstQuestionId = steps[0]?.questions?.[0];
			if (firstQuestionId) {
				applyConfigLayers(firstQuestionId, true);
			}
		}

		setIsSynthesisMode(false);
		setStepperKey((prev) => prev + 1);
	}, [
		restoreModuleState,
		resetDrawInteractions,
		applyConfigLayers,
		setIsSynthesisMode,
	]);

	const onShowSynthesis = useCallback(() => {
		const currentStepId = useUiStore.getState().currentStepId;
		if (currentStepId) {
			useUiStore
				.getState()
				.navigateToModuleQuestion(
					currentStepId as SectionId,
					questionIndices[currentStepId as SectionId],
				);
		}
		saveModuleState();
		setIsSynthesisMode(true);
	}, [questionIndices, saveModuleState, setIsSynthesisMode]);

	return (
		<SideMenu
			open={open}
			onOpenChange={onOpenChange}
			title="Modul 1: Handlungsbedarfe"
			description="Untersuchen Sie Ihr Gebiet auf Handlungsbedarfe"
			footer={null}
			bodyClassName="p-0"
			showStepper={!isSynthesisMode}
		>
			{isSynthesisMode ? (
				<SynthesisView onBackToQuestions={onBackToQuestions} />
			) : (
				<VerticalStepper
					key={`questions-${stepperKey}`}
					steps={steps}
					initialStepId={initialStepId}
				>
					<QuestionsContent
						onClose={() => onOpenChange(false)}
						onShowSynthesis={onShowSynthesis}
					/>
				</VerticalStepper>
			)}
		</SideMenu>
	);
}
