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
import { CarouselWithIndicators } from "../ui/carousel-with-indicators";
import restoreUmlaute from "@/lib/helpers/restoreUmlaute";

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
		} = {},
	} = getModuleInfo || {};
	const [activeSimulation, setActiveSimulation] =
		useState<ActiveSimulation>("waterLevel");
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);
	const [sliderImages, setSliderImages] = useState<
		{ src: string; alt: string; description?: string }[]
	>([]);

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

	useEffect(() => {
		if (!activeSimulation || !floodRiskLayerConfigId) return;
		const configId = `bgi-planer:${activeSimulation === "waterLevel" ? "Wasserstand" : "Gefaehrdungsstufe"}_${floodRiskLayerConfigId}`;
		console.log("configId", configId);
		applyConfigLayers(configId, true);
	}, [activeSimulation, applyConfigLayers]);

	useEffect(() => {
		if (!floodRiskChartFolderSlug || !floodRiskChartFileSlug) return;

		const images = CHARTS.map((chartSlug) => {
			const imageSRC = `/images/floodRiskSimulation/${floodRiskChartFolderSlug}/${chartSlug}_${floodRiskChartFileSlug}.png`;
			return {
				src: imageSRC,
				alt: `${chartSlug}${floodRiskChartFolderSlug}`,
				description: restoreUmlaute(chartSlug.replace(/_/g, " ")),
			};
		});

		setSliderImages(images);
	}, [floodRiskChartFolderSlug, floodRiskChartFileSlug]);

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
				{floodRiskChartFolderSlug && sliderImages.length > 0 && (
					<div className="mt-4">
						<CarouselWithIndicators
							hideTitle
							fullWidthSlider
							narrow
							dark
							slides={sliderImages}
						/>
					</div>
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
