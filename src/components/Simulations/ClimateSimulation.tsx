"use client";

import { Button } from "@/components/ui/button";
import { PencilRulerIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
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
	const { title } = getModuleInfo || {};

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
					<span className="font-bold">Delta / Absolut</span> - Delta zeigt die
					Veränderung gegenüber dem Zustand ohne Maßnahme (die reine Wirkung der
					Begrünung); Absolut die simulierten Ist-Werte inkl. Maßnahme.
				</p>
				<p>
					<span className="font-bold">Messwert</span> - dargestellter Parameter:
					Lufttemperatur (°C), Physiologisch Äquivalente Temperatur / PET (°C -
					thermisches Empfinden inkl. Strahlung und Wind) oder relative
					Luftfeuchtigkeit (%).
				</p>
				<p>
					<span className="font-bold">Ausschöpfung Potentialfläche</span> -
					Umsetzungsgrad der jeweiligen BGI Maßnahme: 100 % (alle Potentiale,
					basierend auf Machbarkeiten ausgeschöpft) oder 50 %.
				</p>
				<p>
					<span className="font-bold">Uhrzeit</span> - Simulationszeitpunkt:
					04:00 (nächtliche Abkühlung), 14:00 (Tagesmaximum) oder 22:00 Uhr.
				</p>
				<p>
					<span className="font-bold">Klimatisches Szenario</span> -
					meteorologisches Szenario: Hitzetag / Tropennacht (extreme Hitze) oder
					Sommertag (durchschnittlich warmer Tag).
				</p>
				<p>
					<span className="font-bold">Ansicht</span> - Schnittebene im
					3D-Modell: Grundriss (xy, horizontal, z. B. 2 m Höhe) oder vertikale
					Schnitte (xz / yz) entlang von Straßen und Gebäudehöhen.
				</p>
				<p>
					<span className="font-bold">Farbskala</span> - Kräftigeres Rot =
					stärkere Wirkung (in der Delta-Ansicht: größere PET-Reduktion /
					Abkühlung). Weiße Flächen sind Gebäude, grüne Punkte Bestandsbäume.
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
		</div>
	);
}
