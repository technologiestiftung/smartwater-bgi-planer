import { useStepValid } from "@/components/Modules/shared/isStepValidUtil";
import { ModuleFooter } from "@/components/Modules/shared/ModuleFooter";
import { ModuleStepper } from "@/components/Modules/shared/ModuleStepper";
import { SectionId } from "@/types/sectionIds";
import { LAYER_IDS } from "@/types/shared";
import { measurePlaningSteps } from "./constants";
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
	const isStepValid = useStepValid({
		stepName: "planingA",
		starterQuestionId: "starter_question",
		layerId: LAYER_IDS.PROJECT_BOUNDARY,
		steps: measurePlaningSteps,
	});

	return (
		<ModuleStepper<SectionId>
			steps={measurePlaningSteps}
			SectionContent={(props) => <SectionContent {...props} />}
			StepperFooter={ModuleFooter}
			SynthesisView={SynthesisView}
			open={open}
			onOpenChange={onOpenChange}
			title="Modul 3: Maßnahmenplanung"
			description="Planen Sie Ihre Maßnahmen im Detail"
			projectId={projectId}
			isStepValid={isStepValid}
		/>
	);
}
