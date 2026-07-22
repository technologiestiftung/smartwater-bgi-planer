"use client";

import { Button } from "@/components/ui/button";
import { PencilRulerIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	getModuleStep,
	getModuleStepMeasure,
} from "../Modules/shared//moduleConfig";
import { ModuleMeasurementConfig, ModuleStepConfig } from "@/types/shared";
import { useEffect, useState } from "react";
import { useLayersStore } from "@/store/layers";
import restoreUmlaute from "@/lib/helpers/restoreUmlaute";
import Image from "next/image";

interface FloodRiskProps {
	floodRisk: string;
	onActivate: (stepId: string, configId: string) => void;
}

type ActiveSimulation = "waterLevel" | "hazardLevel";

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
	const {
		title,
		info: {
			floodRiskLayerConfigId,
			floodRiskChartFolderSlug,
			floodRiskChartFileSlug,
			floodRiskCharts,
		} = {},
	} = getModuleInfo || {};

	const SCENARIOS: { id: ActiveSimulation; label: string }[] = [
		{
			id: "waterLevel",
			label: "Wasserstand",
		},
		{
			id: "hazardLevel",
			label: "Gefährdungsstufe",
		},
	];

	const CHARTS: string[] = [
		"Vergleich_gefaehrdeter_Flaechen",
		"Reduktion_des_Ueberflutungsvolumens",
		"Kombinationsmassnahmen_Gefaehrdungsstufen", // this will not exist for all measures
		"Kombinationsmassnahmen_Ueberflutungsvolumen", // this will not exist for all measures
	];

	const useCharts = floodRiskCharts || CHARTS;

	const [activeSimulation, setActiveSimulation] =
		useState<ActiveSimulation>("waterLevel");
	const [activeChart, setActiveChart] = useState<string>(useCharts[0]);
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);

	useEffect(() => {
		if (!activeSimulation || !floodRiskLayerConfigId) return;
		const configId = `bgi-planer:${activeSimulation === "waterLevel" ? "Wasserstand" : "Gefaehrdungsstufe"}_${floodRiskLayerConfigId}`;
		console.log("configId", configId);
		applyConfigLayers(configId, true);
	}, [activeSimulation, applyConfigLayers]);

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
				<h3 className="text-primary">
					Simulationsergebnisse Überflutungsgefährdung - {title}
				</h3>
				<p className="text-muted-foreground">Erklärende Text...</p>
				{floodRiskLayerConfigId && (
					<div className="flex flex-col gap-2">
						<p className="text-primary text-lg font-bold">
							Simulation auswählen
						</p>
						<div className="flex gap-2">
							{SCENARIOS.map((scenario) => (
								<Button
									key={scenario.id}
									variant={
										activeSimulation === scenario.id ? "default" : "outline"
									}
									size="sm"
									onClick={() => setActiveSimulation(scenario.id)}
									className="text-sm"
								>
									{scenario.label}
								</Button>
							))}
						</div>
					</div>
				)}
				{floodRiskChartFolderSlug && (
					<>
						<div className="flex flex-col gap-2">
							<p className="text-primary text-lg font-bold">
								Diagramm auswählen
							</p>
							<div className="flex flex-wrap gap-2">
								{useCharts.map((chart) => (
									<Button
										key={chart}
										variant={activeChart === chart ? "default" : "outline"}
										size="sm"
										onClick={() => setActiveChart(chart)}
										className="text-sm"
									>
										{restoreUmlaute(chart)}
									</Button>
								))}
							</div>
						</div>
						{(() => {
							const imageSRC = `/images/floodRiskSimulation/${floodRiskChartFolderSlug}/${activeChart}_${floodRiskChartFileSlug}.png`;
							return (
								<Image
									src={imageSRC}
									alt={`${activeChart}${floodRiskChartFolderSlug}`}
									className="mt-4 h-full max-h-[100%] w-full object-contain object-top"
									onError={() => {
										console.error(`Error loading image: ${imageSRC}`);
									}}
									loading="lazy"
									width={1600}
									height={900}
									unoptimized
								/>
							);
						})()}
					</>
				)}
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
