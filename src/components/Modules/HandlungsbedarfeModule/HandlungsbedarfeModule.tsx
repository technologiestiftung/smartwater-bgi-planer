"use client";

import {
	steps,
	type SectionId,
} from "@/components/Modules/HandlungsbedarfeModule/constants";
import { useSectionQuestionState } from "@/components/Modules/HandlungsbedarfeModule/hooks/useSectionQuestionState";
import { SectionContent } from "@/components/Modules/HandlungsbedarfeModule/SectionContent";
import { StepperFooter } from "@/components/Modules/HandlungsbedarfeModule/StepperFooter";
import { SynthesisView } from "@/components/Modules/HandlungsbedarfeModule/SynthesisView";
import { SideMenu } from "@/components/SideMenu";
import {
	StepContainer,
	StepContent,
	StepIndicator,
	VerticalStepper,
} from "@/components/VerticalStepper";
import { useMapReady } from "@/hooks/use-map-ready";
import { useLayersStore } from "@/store/layers";
import { useCallback, useEffect, useState } from "react";

interface HandlungsbedarfeModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
}

export default function HandlungsbedarfeModule({
	open,
	onOpenChange,
}: HandlungsbedarfeModuleProps) {
	const { questionIndices, setQuestionIndex } = useSectionQuestionState();
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);
	const isMapReady = useMapReady();
	const [isSynthesisMode, setIsSynthesisMode] = useState(false);
	const [stepperKey, setStepperKey] = useState(0);

	useEffect(() => {
		if (open && layerConfig.length > 0 && isMapReady) {
			const firstQuestionId = steps[0]?.questions?.[0];
			if (firstQuestionId) {
				console.log(
					"[HandlungsbedarfeModule] Initializing first question:",
					firstQuestionId,
				);
				applyConfigLayers(firstQuestionId);
			}
		}
	}, [open, layerConfig.length, applyConfigLayers, isMapReady]);

	const handleBackToQuestions = useCallback(() => {
		setQuestionIndex("heavyRain", 0);
		setIsSynthesisMode(false);
		setStepperKey((prev) => prev + 1);

		const firstQuestionId = steps[0]?.questions?.[0];
		if (firstQuestionId) {
			applyConfigLayers(firstQuestionId);
		}
	}, [setQuestionIndex, applyConfigLayers]);

	const handleShowSynthesis = useCallback(() => {
		setIsSynthesisMode(true);
	}, []);

	return (
		<SideMenu
			open={open}
			onOpenChange={onOpenChange}
			title="Modul 1: Handlungsbedarfe"
			description="Untersuchen Sie Ihr Gebiet auf Handlungsbedarfe"
			footer={null}
			bodyClassName="p-0"
		>
			{isSynthesisMode ? (
				<SynthesisView onBackToQuestions={handleBackToQuestions} />
			) : (
				<VerticalStepper
					key={`questions-${stepperKey}`}
					steps={steps}
					initialStepId="heavyRain"
				>
					<div className="flex h-full w-full flex-col">
						<div className="flex min-h-0 flex-1 pb-4">
							<StepIndicator className="w-20" />
							<StepContainer className="overflow-y-auto">
								{steps.map((step) => (
									<StepContent key={step.id} stepId={step.id}>
										<SectionContent
											sectionId={step.id as SectionId}
											questionIndices={questionIndices}
											setQuestionIndex={setQuestionIndex}
										/>
									</StepContent>
								))}
							</StepContainer>
						</div>
						<div className="shrink-0">
							<StepperFooter
								onClose={() => onOpenChange(false)}
								questionIndices={questionIndices}
								setQuestionIndex={setQuestionIndex}
								onShowSynthesis={handleShowSynthesis}
							/>
						</div>
					</div>
				</VerticalStepper>
			)}
		</SideMenu>
	);
}
