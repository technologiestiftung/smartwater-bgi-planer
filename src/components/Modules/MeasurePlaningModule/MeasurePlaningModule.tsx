"use client";

import {
	getModuleMetadata,
	getModuleSteps,
} from "@/components/Modules/shared/moduleConfig";
import { ModuleFooter } from "@/components/Modules/shared/ModuleFooter";
import { ModuleStepper } from "@/components/Modules/shared/ModuleStepper";
import { useStepValid } from "@/lib/helpers/isStepValidUtil";
import { useUiStore } from "@/store/ui";
import { SectionId } from "@/types/sectionIds";
import { LAYER_IDS } from "@/types/shared";
import { useEffect } from "react";
import { SectionContent } from "./SectionContent";
import { SynthesisView } from "./SynthesisView";

interface MeasurePlaningModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
}

export default function MeasurePlaningModule({
	open,
	onOpenChange,
	projectId,
}: MeasurePlaningModuleProps) {
	const steps = getModuleSteps("measurePlaning");
	const { title, description } = getModuleMetadata("measurePlaning");
	const isStepValid = useStepValid({
		stepName: "planingA",
		starterQuestionId: "starter_question",
		layerId: LAYER_IDS.PROJECT_BOUNDARY,
		steps,
	});

	const resetModuleState = useUiStore((state) => state.resetModuleState);
	useEffect(() => {
		resetModuleState();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<ModuleStepper<SectionId>
			steps={steps}
			SectionContent={(props) => <SectionContent {...props} />}
			StepperFooter={ModuleFooter}
			SynthesisView={SynthesisView}
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			description={description}
			projectId={projectId}
			isStepValid={isStepValid}
		/>
	);
}
