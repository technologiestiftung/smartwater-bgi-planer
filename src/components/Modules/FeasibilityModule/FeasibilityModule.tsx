import { useStepValid } from "@/components/Modules/shared/isStepValidUtil";
import {
	getModuleMetadata,
	getModuleSteps,
} from "@/components/Modules/shared/moduleConfig";
import { ModuleFooter } from "@/components/Modules/shared/ModuleFooter";
import { ModuleStepper } from "@/components/Modules/shared/ModuleStepper";
import { SectionId } from "@/types/sectionIds";
import { LAYER_IDS } from "@/types/shared";
import { SectionContent } from "./SectionContent";
import { SynthesisView } from "./SynthesisView";

interface FeasibilityModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
}

export default function FeasibilityModule({
	open,
	onOpenChange,
	projectId,
}: FeasibilityModuleProps) {
	const steps = getModuleSteps("feasibility");
	const { title, description } = getModuleMetadata("feasibility");

	const isStepValid = useStepValid({
		stepName: "versickerung",
		starterQuestionId: "2V1",
		layerId: LAYER_IDS.PROJECT_BOUNDARY,
		steps,
	});

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
