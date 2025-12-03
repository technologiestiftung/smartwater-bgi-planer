"use client";

import { needForActionSteps } from "@/components/Modules/NeedForActionModule/constants";
import { SectionContent } from "@/components/Modules/NeedForActionModule/SectionContent";
import { SynthesisView } from "@/components/Modules/NeedForActionModule/SynthesisView";
import { useStepValid } from "@/components/Modules/shared/isStepValidUtil";
import { ModuleFooter } from "@/components/Modules/shared/ModuleFooter";
import { ModuleStepper } from "@/components/Modules/shared/ModuleStepper";
import { SectionId } from "@/types/sectionIds";
import { LAYER_IDS } from "@/types/shared";

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
	const isStepValid = useStepValid({
		stepName: "heavyRain",
		starterQuestionId: "starter_question",
		layerId: LAYER_IDS.PROJECT_BOUNDARY,
		steps: needForActionSteps,
	});

	return (
		<ModuleStepper<SectionId>
			steps={needForActionSteps}
			SectionContent={(props) => <SectionContent {...props} />}
			StepperFooter={ModuleFooter}
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
