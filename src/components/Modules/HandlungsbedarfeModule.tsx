"use client";

import { SideMenu } from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import {
	VerticalStepper,
	StepIndicator,
	StepContent,
	StepContainer,
	useVerticalStepper,
	StepConfig,
} from "@/components/VerticalStepper";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CloudRainIcon,
	DropIcon,
	FishIcon,
	ListChecksIcon,
	RoadHorizonIcon,
	ThermometerHotIcon,
} from "@phosphor-icons/react";

interface HandlungsbedarfeModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
}

const steps: StepConfig[] = [
	{
		id: "heavyRain",
		icon: <CloudRainIcon />,
		title: "Starkregen",
		description: "xxx",
	},
	{
		id: "heat",
		icon: <ThermometerHotIcon />,
		title: "Hitze",
		description: "xxx",
	},
	{
		id: "sealing",
		icon: <RoadHorizonIcon />,
		title: "Versiegelung",
		description: "xxx",
	},
	{
		id: "waterProtection",
		icon: <FishIcon />,
		title: "Gewässerschutz",
		description: "xxx",
	},
	{
		id: "waterBalance",
		icon: <DropIcon />,
		title: "Wasserhaushalt",
		description: "xxx",
	},
];

function StepperFooter({ onClose }: { onClose: () => void }) {
	const { previousStep, nextStep, canGoPrevious, canGoNext } =
		useVerticalStepper();

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

export default function HandlungsbedarfeModule({
	open,
	onOpenChange,
}: HandlungsbedarfeModuleProps) {
	return (
		<SideMenu
			open={open}
			onOpenChange={onOpenChange}
			title="Modul 1: Handlungsbedarfe"
			description="Untersuchen Sie Ihr Gebiet auf Handlungsbedarfe"
			footer={null}
			bodyClassName="p-0"
		>
			<VerticalStepper steps={steps} initialStepId="heat">
				<div className="flex h-full w-full flex-col">
					<div className="flex flex-grow">
						<StepIndicator className="w-20" />
						<StepContainer>
							<StepContent stepId="heat">
								<div className="space-y-4">
									<h3 className="text-primary">Hitze</h3>
									<p className="text-muted-foreground underline"></p>
								</div>
							</StepContent>

							<StepContent stepId="heavyRain">
								<div className="space-y-4">
									<h3 className="text-primary">Starkregen</h3>
									<p className="text-muted-foreground"></p>
								</div>
							</StepContent>

							<StepContent stepId="sealing">
								<div className="space-y-4">
									<h3 className="text-primary">Versickerung</h3>
									<p className="text-muted-foreground"></p>
								</div>
							</StepContent>

							<StepContent stepId="waterProtection">
								<div className="space-y-4">
									<h3 className="text-primary">Wasserschutz</h3>
									<p className="text-muted-foreground"></p>
								</div>
							</StepContent>

							<StepContent stepId="waterBalance">
								<div className="space-y-4">
									<h3 className="text-primary">Wasserhaushalt</h3>
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
