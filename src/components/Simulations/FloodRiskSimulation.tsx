"use client";

import { Button } from "@/components/ui/button";
import restoreUmlaute from "@/lib/helpers/restoreUmlaute";
import { cn } from "@/lib/utils";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { ModuleMeasurementConfig, ModuleStepConfig } from "@/types/shared";
import {
	ArrowRightIcon,
	InfoIcon,
	PencilRulerIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getCenter } from "ol/extent";
import { transformExtent } from "ol/proj";
import { useEffect, useRef, useState } from "react";
import {
	getModuleStep,
	getModuleStepMeasure,
} from "../Modules/shared/moduleConfig";

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
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);
	const {
		title,
		info: {
			floodRiskLayerConfigId,
			floodRiskChartFolderSlug,
			floodRiskChartFileSlug,
			floodRiskCharts,
			floodRiskText,
		} = {},
	} = getModuleInfo || {};

	const SCENARIOS: {
		id: ActiveSimulation;
		label: string;
		legendLabel?: string;
	}[] = [
		{
			id: "waterLevel",
			label: "Wasserstand",
			legendLabel: "Wasserstand in cm",
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
	const [showCurrentState, setShowCurrentState] = useState(false);
	const [mapWasZoomed, setMapWasZoomed] = useState(false);
	const [activeChart, setActiveChart] = useState<string>(useCharts[0]);
	const [currentZoom, setCurrentZoom] = useState(0);
	const layers = useLayersStore((state) => state.layers);
	const map = useMapStore((state) => state.map);
	const floodRiskLayerConfigIdRef = useRef(floodRiskLayerConfigId);

	useEffect(() => {
		if (!map) return;

		const view = map.getView();
		if (!view) return;

		const updateZoom = () => {
			const zoom = view.getZoom();
			setCurrentZoom(Math.floor(zoom || 0));
		};

		updateZoom();

		view.on("change:resolution", updateZoom);
		return () => {
			view.un("change:resolution", updateZoom);
		};
	}, [map]);

	useEffect(() => {
		if (!activeSimulation || !floodRiskLayerConfigId || layers.size === 0)
			return;

		const layerIds = {
			waterLevel: `bgi-planer:Wasserstand_${floodRiskLayerConfigId}`,
			waterLevelCurrentState: "bgi-planer:Wasserstand_Ist-Zustand",
			hazardLevel: `bgi-planer:Gefaehrdungsstufe_${floodRiskLayerConfigId}`,
			hazardLevelCurrentState: "bgi-planer:Gefaehrdungsstufe_Ist-Zustand",
		};

		const scenarioConfigId =
			activeSimulation === "waterLevel"
				? layerIds.waterLevel
				: layerIds.hazardLevel;
		const currentStateConfigId =
			activeSimulation === "waterLevel"
				? layerIds.waterLevelCurrentState
				: layerIds.hazardLevelCurrentState;
		const activeConfigId = showCurrentState
			? currentStateConfigId
			: scenarioConfigId;

		Object.values(layerIds).forEach((configId) => {
			const layer = layers.get(configId);
			const shouldBeVisible = configId === activeConfigId;
			if (layer && layer.visibility !== shouldBeVisible) {
				setLayerVisibility(configId, shouldBeVisible);
			}
		});
	}, [
		activeSimulation,
		showCurrentState,
		floodRiskLayerConfigId,
		layers,
		setLayerVisibility,
	]);

	useEffect(() => {
		if (!map || mapWasZoomed) return;

		const simulationView = {
			bbox: [13.447359, 52.496827, 13.477934, 52.528612],
			zoom: 4,
			duration: 800,
			padding: [40, 40, 40, 40],
		};
		const { bbox, zoom, duration, padding } = simulationView;
		const view = map.getView();

		const mapProjection = view.getProjection().getCode();
		const transformedExtent = transformExtent(bbox, "EPSG:4326", mapProjection);

		if (typeof zoom === "number") {
			view.animate({
				center: getCenter(transformedExtent),
				zoom,
				duration,
			});
			setMapWasZoomed(true);
			return;
		}

		view.fit(transformedExtent, {
			duration,
			padding,
		});
	}, [activeSimulation, map, mapWasZoomed, setMapWasZoomed]);

	useEffect(() => {
		floodRiskLayerConfigIdRef.current = floodRiskLayerConfigId;
	}, [floodRiskLayerConfigId]);

	useEffect(() => {
		return () => {
			const currentId = floodRiskLayerConfigIdRef.current;
			if (currentId) {
				setLayerVisibility(`bgi-planer:Wasserstand_${currentId}`, false);
				setLayerVisibility(`bgi-planer:Gefaehrdungsstufe_${currentId}`, false);
			}
			setLayerVisibility("bgi-planer:Wasserstand_Ist-Zustand", false);
			setLayerVisibility("bgi-planer:Gefaehrdungsstufe_Ist-Zustand", false);
		};
	}, [setLayerVisibility]);

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
				<h3 className="text-primary">
					Simulationsergebnisse Überflutungsgefährdung - {title}
				</h3>
				{Array.isArray(floodRiskText) && (
					<>
						{floodRiskText.map((text, index) => (
							<p key={index} className="text-muted-foreground">
								{text}
							</p>
						))}
					</>
				)}
				{floodRiskLayerConfigId && (
					<div className="flex flex-col gap-2">
						<p className="text-primary text-lg font-bold">
							Simulation auswählen
						</p>

						<div className="mb-4 flex flex-wrap gap-6">
							{SCENARIOS.map((scenario) => {
								const isActiveScenario = activeSimulation === scenario.id;
								const showsCurrentState = isActiveScenario && showCurrentState;
								const showsSimulation = isActiveScenario && !showCurrentState;
								return (
									<div key={scenario.id} className="flex flex-col gap-2">
										<p className="text-primary text-sm font-bold">
											{scenario.label}
										</p>
										<div className="border-primary inline-flex overflow-hidden rounded-xs border-2">
											<button
												type="button"
												aria-pressed={showsCurrentState}
												onClick={() => {
													setActiveSimulation(scenario.id);
													setShowCurrentState(true);
												}}
												className={cn(
													"focus-visible:ring-ring/50 flex h-8 flex-1 cursor-pointer items-center justify-center px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px]",
													showsCurrentState
														? "bg-primary text-primary-foreground"
														: "bg-background text-primary hover:bg-light",
												)}
											>
												Ist-Zustand
											</button>
											<button
												type="button"
												aria-pressed={showsSimulation}
												onClick={() => {
													setActiveSimulation(scenario.id);
													setShowCurrentState(false);
												}}
												className={cn(
													"border-primary focus-visible:ring-ring/50 flex h-8 flex-1 cursor-pointer items-center justify-center border-l-2 px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px]",
													showsSimulation
														? "bg-primary text-primary-foreground"
														: "bg-background text-primary hover:bg-light",
												)}
											>
												Simulation
											</button>
										</div>
									</div>
								);
							})}
						</div>
						<div className="border-primary bg-primary-50 text-primary mb-4 flex items-start gap-2 rounded-sm border border-dashed p-3 text-sm">
							<span className="text-primary mt-0.5">
								<InfoIcon size={20} weight="duotone" />
							</span>
							<span>
								Bitte beachten Sie, dass Sie zum Darstellen der Karten ein
								Zoomlevel von mindestens
								<span className="font-bold"> 4 </span>
								benötigen.
								<br />
								Ihr aktuelles Zoomlevel ist
								<span
									className={
										currentZoom < 4 ? "text-red font-bold" : "font-bold"
									}
								>
									&nbsp;{currentZoom}
								</span>
								.
							</span>
						</div>
						<div className="mb-4 flex flex-col gap-2">
							{SCENARIOS.map((scenario) => (
								<div key={scenario.id}>
									<h5 className="text-primary mb-2 text-sm font-medium">
										{scenario.legendLabel || scenario.label}
									</h5>
									<Image
										src={`/legends/${scenario.id}.svg`}
										alt="Legende für die Karte"
										width={400}
										height={200}
										className="h-4.5 w-auto"
									/>
								</div>
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
							const imageSRC = `/images/floodRiskSimulation/${floodRiskChartFolderSlug}/${activeChart}_${floodRiskChartFileSlug || floodRiskChartFolderSlug}.png`;
							return (
								<Image
									src={imageSRC}
									alt={`${activeChart}${floodRiskChartFolderSlug}`}
									className="mt-4 h-full max-h-full w-full object-contain object-top align-top"
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
