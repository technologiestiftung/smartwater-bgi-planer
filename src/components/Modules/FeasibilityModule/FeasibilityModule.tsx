import { GenericStepperFooter } from "@/components/Modules/shared/GenericStepperFooter";
import { ModuleStepper } from "@/components/Modules/shared/ModuleStepper";
import { FeasibilitySectionId, feasibilitySteps } from "./constants";
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
	return (
		<ModuleStepper<FeasibilitySectionId>
			steps={feasibilitySteps}
			SectionContent={(props) => <SectionContent {...props} />}
			StepperFooter={GenericStepperFooter}
			SynthesisView={SynthesisView}
			open={open}
			onOpenChange={onOpenChange}
			title="Modul 2: Machbarkeit"
			description="Untersuchen Sie die Machbarkeit Ihrer Maßnahmen"
			projectId={projectId}
		/>
	);
}
