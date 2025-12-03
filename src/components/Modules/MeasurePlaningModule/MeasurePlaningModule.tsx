import { GenericStepperFooter } from "@/components/Modules/shared/GenericStepperFooter";
import { ModuleStepper } from "@/components/Modules/shared/ModuleStepper";
import { MeasurePlaningSectionId, measurePlaningSteps } from "./constants";
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
	return (
		<ModuleStepper<MeasurePlaningSectionId>
			steps={measurePlaningSteps}
			SectionContent={(props) => <SectionContent {...props} />}
			StepperFooter={GenericStepperFooter}
			SynthesisView={SynthesisView}
			open={open}
			onOpenChange={onOpenChange}
			title="Modul 3: Maßnahmenplanung"
			description="Planen Sie Ihre Maßnahmen im Detail"
			projectId={projectId}
		/>
	);
}
