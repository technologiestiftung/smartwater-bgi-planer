"use client";

import { Button } from "@/components/ui/button";
import { PencilRulerIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getModuleStep, getModuleStepMeasure } from "../shared/moduleConfig";
import { ModuleMeasurementConfig, ModuleStepConfig } from "@/types/shared";

interface CityClimateSimulationProps {
	cityClimateSimulation: string;
	onActivate: (stepId: string, configId: string) => void;
}

export function CityClimateSimulation({
	cityClimateSimulation,
	onActivate,
}: CityClimateSimulationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const getModuleInfo = getModuleStepMeasure(
		"measurePlanning",
		cityClimateSimulation,
	) as ModuleMeasurementConfig;
	const getStep = getModuleStep(
		"measurePlanning",
		cityClimateSimulation,
	) as ModuleStepConfig;
	const { title, cityClimateSimulation: { description } = {} } =
		getModuleInfo || {};

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
				<h3 className="text-primary">
					Simulationsergebnisse Stadtklima - {title}
				</h3>
				<p>{description}</p>
			</div>
			<div className="border-muted bg-secondary flex shrink-0 border-t px-4">
				<Button
					onClick={() => router.back()}
					className="text-md my-4 flex-1 text-white hover:text-white"
					size="lg"
					variant="ghost"
				>
					<PencilRulerIcon className="h-4 w-4" />
					zu der Maßnahme
				</Button>
				<div className="w-px self-stretch bg-white" />
				<Button
					onClick={() => {
						const params = new URLSearchParams(searchParams.toString());
						params.delete("cityClimateSimulation");
						router.replace(`?${params.toString()}`);
						onActivate(getStep?.id || "", cityClimateSimulation);
					}}
					className="text-md my-4 flex-1 text-white hover:text-white"
					size="lg"
					variant="ghost"
				>
					Maßnahme platzieren
					<ArrowRightIcon className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
