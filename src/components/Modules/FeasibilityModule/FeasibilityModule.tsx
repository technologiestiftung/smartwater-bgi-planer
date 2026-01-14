"use client";

import { useStepValid } from "@/components/Modules/shared/isStepValidUtil";
import {
	getModuleMetadata,
	getModuleSteps,
} from "@/components/Modules/shared/moduleConfig";
import { ModuleFooter } from "@/components/Modules/shared/ModuleFooter";
import { ModuleStepper } from "@/components/Modules/shared/ModuleStepper";
import { SideMenu } from "@/components/SideMenu";
import { useUiStore } from "@/store";
import { SectionId } from "@/types/sectionIds";
import { LAYER_IDS } from "@/types/shared";
import { useCallback, useState } from "react";
import PotentialMapsView from "./PotentialMapsView";
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
	const [showPotentialMaps, setShowPotentialMaps] = useState(false);
	const setShowStepper = useUiStore((state) => state.setShowStepper);

	const isStepValid = useStepValid({
		stepName: "seepage",
		starterQuestionId: "feasibility_module_introduction",
		layerId: LAYER_IDS.PROJECT_BOUNDARY,
		steps,
	});

	const handleShowPotentialMaps = useCallback(() => {
		console.log("handleShowPotentialMaps called");
		setShowPotentialMaps(true);
		setShowStepper(false);
	}, [setShowStepper]);

	const handleBackFromPotentialMaps = useCallback(() => {
		setShowPotentialMaps(false);
		setShowStepper(true);
	}, [setShowStepper]);

	if (showPotentialMaps) {
		return (
			<SideMenu
				open={open}
				onOpenChange={onOpenChange}
				title={title}
				description={description}
				footer={null}
				bodyClassName="p-0"
				showStepper={false}
			>
				<PotentialMapsView
					onBackToQuestions={handleBackFromPotentialMaps}
					description="Hier sehen Sie die Potentialkarten der Maßnahmengruppen für die Versickerung."
				/>
			</SideMenu>
		);
	}

	return (
		<ModuleStepper<SectionId>
			steps={steps}
			SectionContent={(props) => (
				<SectionContent
					{...props}
					onShowPotentialMaps={handleShowPotentialMaps}
				/>
			)}
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
