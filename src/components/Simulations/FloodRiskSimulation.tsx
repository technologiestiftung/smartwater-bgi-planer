"use client";

import { Button } from "@/components/ui/button";
import { PencilRulerIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	getModuleStep,
	getModuleStepMeasure,
} from "../Modules/shared//moduleConfig";
import { ModuleMeasurementConfig, ModuleStepConfig } from "@/types/shared";
import { Pill } from "../ui/pill";
import { useState } from "react";

interface FloodRiskProps {
	floodRisk: string;
	onActivate: (stepId: string, configId: string) => void;
}

export function FloodRisk({ floodRisk, onActivate }: FloodRiskProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const getModuleInfo = getModuleStepMeasure(
		"measurePlanning",
		floodRisk,
	) as ModuleMeasurementConfig;
	const getStep = getModuleStep(
		"measurePlanning",
		floodRisk,
	) as ModuleStepConfig;
	const { title } = getModuleInfo || {};
	const [activeSimulation, setActiveSimulation] = useState<
		"waterLevel" | "hazardLevel"
	>("waterLevel");

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
				<h3 className="text-primary">
					Simulationsergebnisse Überflutungsgefährdung - {title}
				</h3>
				<p className="text-muted-foreground">Erklärende Text...</p>
				<div className="flex flex-col gap-2">
					<p className="text-primary text-lg font-bold">Simulation auswählen</p>
					<div className="flex gap-2">
						<Pill
							className="cursor-pointer rounded-sm"
							variant={
								activeSimulation === "waterLevel" ? "default" : "secondary"
							}
							onClick={() => setActiveSimulation("waterLevel")}
						>
							<p className="text-sm select-none">Wasserstand</p>
						</Pill>
						<Pill
							className="cursor-pointer rounded-sm"
							variant={
								activeSimulation === "hazardLevel" ? "default" : "secondary"
							}
							onClick={() => setActiveSimulation("hazardLevel")}
						>
							<p className="text-sm select-none">Gefährdungsstufe</p>
						</Pill>
					</div>
				</div>
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
						params.delete("floodRisk");
						router.replace(`?${params.toString()}`);
						onActivate(getStep?.id || "", floodRisk);
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
