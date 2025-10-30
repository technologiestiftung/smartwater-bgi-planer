"use client";

import { SideMenu } from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import {
	StepConfig,
	StepContainer,
	StepContent,
	StepIndicator,
	useVerticalStepper,
	VerticalStepper,
} from "@/components/VerticalStepper";
import { useMapReady } from "@/hooks/use-map-ready";
import { useLayersStore } from "@/store/layers";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BlueprintIcon,
	ListChecksIcon,
	MapPinAreaIcon,
} from "@phosphor-icons/react";
import { useEffect } from "react";

interface ProjectStarterModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
}

const steps: StepConfig[] = [
	{
		id: "projectBoundary",
		icon: <MapPinAreaIcon />,
		title: "Projektgebiet anlegen",
		description: "xxx",
	},
	{
		id: "newDevelopment",
		icon: <BlueprintIcon />,
		title: "Neubauten und Versiegelte Flächen anlegen",
		description: "xxx",
	},
];

function StepperFooter({ onClose }: { onClose: () => void }) {
	const { previousStep, nextStep, canGoPrevious, canGoNext, currentStepId } =
		useVerticalStepper();
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);
	const isMapReady = useMapReady();

	useEffect(() => {
		if (!isMapReady) return;

		if (currentStepId === "projectBoundary") {
			applyConfigLayers("start_view_project_boundary");
		} else if (currentStepId === "newDevelopment") {
			applyConfigLayers("start_view_project_new_development");
		}
	}, [currentStepId, applyConfigLayers, isMapReady]);

	return (
		<div className="border-muted flex h-full w-full border-t">
			<div className="bg-secondary flex w-[4.5rem] items-center justify-center">
				<ListChecksIcon className="h-6 w-6 text-white" />
			</div>
			<div className="flex w-full items-center justify-between p-2">
				<Button
					variant="ghost"
					onClick={canGoPrevious ? previousStep : onClose}
				>
					<ArrowLeftIcon />
					{canGoPrevious ? "Zurück" : "Schließen"}
				</Button>
				<Button variant="ghost" onClick={nextStep} disabled={!canGoNext}>
					Überspringen
					<ArrowRightIcon />
				</Button>
			</div>
		</div>
	);
}

export default function ProjectStarterModule({
	open,
	onOpenChange,
}: ProjectStarterModuleProps) {
	return (
		<SideMenu
			open={open}
			onOpenChange={onOpenChange}
			title="Projekt anlegen"
			description="Untersuchungsgebiet anlegen"
			footer={null}
			bodyClassName="p-0"
		>
			<VerticalStepper steps={steps} initialStepId="projectBoundary">
				<div className="flex h-full w-full flex-col">
					<div className="flex flex-grow">
						<StepIndicator className="w-20" />
						<StepContainer>
							<StepContent stepId="projectBoundary">
								<div className="space-y-4">
									<h3 className="text-primary">Untersuchtungsgebiet</h3>
									<p className="text-muted-foreground underline"></p>
								</div>
							</StepContent>

							<StepContent stepId="newDevelopment">
								<div className="space-y-4">
									<h3 className="text-primary">
										Neubauten und Versiegelte Flächen
									</h3>
									<p className="text-muted-foreground"></p>
								</div>
							</StepContent>
						</StepContainer>
					</div>
					<div className="flex-shrink-0">
						<StepperFooter onClose={() => onOpenChange(false)} />
					</div>
				</div>
			</VerticalStepper>
		</SideMenu>
	);
}
