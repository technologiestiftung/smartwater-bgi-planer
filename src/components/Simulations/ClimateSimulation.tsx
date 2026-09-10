"use client";

import { PageModal } from "@/components/Modal/Modal";
import { Button } from "@/components/ui/button";
import { PencilRulerIcon, ArrowRightIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
	getModuleStep,
	getModuleStepMeasure,
} from "../Modules/shared//moduleConfig";
import { ModuleMeasurementConfig, ModuleStepConfig } from "@/types/shared";

interface ClimateSimulationProps {
	climateSimulation: string;
	onActivate: (stepId: string, configId: string) => void;
}

export function ClimateSimulation({
	climateSimulation,
	onActivate,
}: ClimateSimulationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const getModuleInfo = getModuleStepMeasure(
		"measurePlanning",
		climateSimulation,
	) as ModuleMeasurementConfig;
	const getStep = getModuleStep(
		"measurePlanning",
		climateSimulation,
	) as ModuleStepConfig;
	const {
		title,
		info: { climateSimulationGraphic: climateSimulationGraphicImage } = {},
	} = getModuleInfo || {};
	const [climateSimulationGraphic, setClimateSimulationGraphic] = useState("");

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
				<h3 className="text-primary">
					Simulationsergebnisse Stadtklima - {title}
				</h3>
				<p>
					Die Karte zeigt die mikroklimatische Wirkung der Maßnahme im
					Pilotgebiet Friedrichshain. Über die Auswahlfelder am oberen Rand
					steuern Sie, was dargestellt wird:
				</p>
				<p>
					<span className="font-bold">Delta / Absolut:</span> Unter „Absolut“
					werden die tatsächlichen simulierten Parameterwerte dargestellt. Die
					Ansicht „Delta“ zeigt die Differenz zum IST-Zustand.
				</p>
				<p>
					<span className="font-bold">Messwert:</span> Für die Darstellung von
					Veränderungen stehen drei Parameter zur Verfügung: Temperatur (in °C),
					Physiologisch Äquivalente Temperatur (PET, in °C) und Luftfeuchtigkeit
					(in %). Hinweis: PET wird nur bis zu einer Höhe von 10 m dargestellt.
				</p>
				<p>
					<span className="font-bold">Ausschöpfung Potentialfläche:</span> Der
					Umsetzungsgrad der jeweiligen BGI-Maßnahme wird auf Grundlage von
					Potenzialkarten und der ermittelten Machbarkeiten dargestellt. Dabei
					wird zwischen einer Nutzung von 100 % und 50 % der möglichen Fläche
					unterschieden.
				</p>
				<p>
					<span className="font-bold">Uhrzeit - Simulationszeitpunkt:</span> Es
					kann zwischen drei Simulationszeitpunkten gewählt werden: 04:00 Uhr,
					14:00 Uhr und 22:00 Uhr.
				</p>
				<p>
					<span className="font-bold">Klimaszenarien:</span> Es wurden zwei
					Klimaszenarien berechnet: der Hitzetag mit Höchsttemperaturen von über
					30 °C und vorrausgegangener Tropennacht sowie der Sommertag mit
					Höchsttemperaturen von über 25 °C.
				</p>
				<p>
					<span className="font-bold">Ansicht:</span> Die Karten werden in drei
					unterschiedlichen Höhen dargestellt: 2m, 10m und 25m. Zusätzlich
					stehen zwei beispielhafte Querschnitte zur Verfügung.
				</p>
				<p>
					<span className="font-bold">Farbskala:</span> Die Farbskalen verlaufen
					grundsätzlich von Blau nach Rot. Blau steht dabei für eine niedrige
					Temperaturen und niedrigere Luftfeuchtigkeit . Die grünen Punkte
					kennzeichnen Bäume, während weiße Flächen Gebäude darstellen.
				</p>
				<p>
					Ein erklärende Grafik finden Sie{" "}
					<button
						type="button"
						onClick={() =>
							setClimateSimulationGraphic(climateSimulationGraphicImage || "")
						}
						className="text-primary hover:text-primary-dark cursor-pointer underline"
					>
						hier
					</button>
					.
				</p>
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
						params.delete("climateSimulation");
						router.replace(`?${params.toString()}`);
						onActivate(getStep?.id || "", climateSimulation);
					}}
					className="text-md my-4 flex-1 text-white hover:text-white"
					size="lg"
					variant="ghost"
				>
					Maßnahme platzieren
					<ArrowRightIcon className="h-4 w-4" />
				</Button>
			</div>
			<PageModal
				open={!!climateSimulationGraphic}
				onOpenChange={() => setClimateSimulationGraphic("")}
				title="Erklärende Grafik"
				bodyClassName="p-0"
			>
				{!!climateSimulationGraphic && (
					<Image
						src={climateSimulationGraphic}
						alt="Erklärende Grafik"
						width={1600}
						height={900}
						className="h-auto w-full"
						unoptimized
					/>
				)}
			</PageModal>
		</div>
	);
}
