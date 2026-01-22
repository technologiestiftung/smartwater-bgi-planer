"use client";

import { SectionContent } from "@/components/Modules/NeedForActionModule/SectionContent";
import { SynthesisView } from "@/components/Modules/NeedForActionModule/SynthesisView";
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
	const steps = getModuleSteps("needForAction");
	const { title, description } = getModuleMetadata("needForAction");
	const isStepValid = useStepValid({
		stepName: "heavyRain",
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
