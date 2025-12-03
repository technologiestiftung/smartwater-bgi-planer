"use client";

import {
	steps,
	type SectionId,
} from "@/components/Modules/NeedForActionModule/constants";
import { SectionContent } from "@/components/Modules/NeedForActionModule/SectionContent";
import { SynthesisView } from "@/components/Modules/NeedForActionModule/SynthesisView";
import { GenericStepperFooter } from "@/components/Modules/shared/GenericStepperFooter";
import { ModuleStepper } from "@/components/Modules/shared/ModuleStepper";
import { useLayerFeatures } from "@/hooks/use-layer-features";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import { useCallback } from "react";

interface NeedForActionModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
}

export default function NeedForActionModule({
	open,
	onOpenChange,
	projectId,
}: NeedForActionModuleProps) {
	const { hasFeatures: hasProjectBoundary } = useLayerFeatures(
		LAYER_IDS.PROJECT_BOUNDARY,
	);
	const questionIndices = useUiStore((state) => state.moduleQuestionIndices);

	const isStepValid = useCallback(
		(stepId: string) => {
			if (stepId === "heavyRain") {
				const currentQuestionIndex = questionIndices.heavyRain;
				const heavyRainQuestions = steps.find(
					(s) => s.id === "heavyRain",
				)?.questions;
				const currentQuestionId = heavyRainQuestions?.[currentQuestionIndex];
				const isStarterQuestion = currentQuestionId === "starter_question";
				return !isStarterQuestion || hasProjectBoundary;
			}
			return true;
		},
		[hasProjectBoundary, questionIndices],
	);

	return (
		<ModuleStepper<SectionId>
			steps={steps}
			SectionContent={(props) => <SectionContent {...props} />}
			StepperFooter={GenericStepperFooter}
			SynthesisView={SynthesisView}
			open={open}
			onOpenChange={onOpenChange}
			title="Modul 1: Handlungsbedarfe"
			description="Untersuchen Sie Ihr Gebiet auf Handlungsbedarfe"
			projectId={projectId}
			isStepValid={isStepValid}
		/>
	);
}
