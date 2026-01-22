"use client";

import { Button } from "@/components/ui/button";
import { useLayersStore } from "@/store";
import { useMapStore } from "@/store/map";
import {
	InfoIcon,
	WaveSineIcon,
	WaveSquareIcon,
	WaveTriangleIcon,
} from "@phosphor-icons/react";
import { FC, useEffect, useState } from "react";

interface ScenarioDisplayProps {}

const SCENARIOS = [
	{
		id: 1,
		label: "einfache Umsetzung",
		configId: "2V1",
		icon: <WaveSineIcon />,
	},
	{
		id: 2,
		label: "gängige Praxis",
		configId: "2V1.1",
		icon: <WaveTriangleIcon />,
	},
	{
		id: 3,
		label: "aufwendige Umsetzung",
		configId: "2V1.2",
		icon: <WaveSquareIcon />,
	},
];

const ScenarioDisplay: FC<ScenarioDisplayProps> = ({}) => {
	const [selectedScenario, setSelectedScenario] = useState("2V1");
	const [currentZoom, setCurrentZoom] = useState(0);
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);
	const map = useMapStore((state) => state.map);

	useEffect(() => {
		if (!map) return;

		const view = map.getView();
		if (!view) return;

		const updateZoom = () => {
			const zoom = view.getZoom();
			setCurrentZoom(Math.round(zoom || 0));
		};

		updateZoom();

		view.on("change:resolution", updateZoom);
		return () => {
			view.un("change:resolution", updateZoom);
		};
	}, [map]);

	useEffect(() => {
		applyConfigLayers(selectedScenario, true);
	}, [selectedScenario, applyConfigLayers]);

	return (
		<div className="ScenarioDisplay-root my-6">
			<p className="mb-2 font-semibold">Szenario auswählen</p>
			<div className="mb-4 wrap-break-word">
				Wählen Sie ein Szenario, um die Potenziale der Maßnahmen in
				unterschiedlichem Umsetzungsaufwand anzuzeigen.
			</div>

			<div className="border-primary bg-primary-50 text-primary mb-3 flex items-start gap-2 rounded-sm border border-dashed p-3 text-sm">
				<span className="text-primary mt-0.5">
					<InfoIcon size={20} weight="duotone" />
				</span>
				<span>
					Bitte beachten Sie, dass Sie zum Darstellen der Karten ein Zoomlevel
					von mindestens
					<span className="font-bold"> 6 </span>
					benötigen.
					<br />
					Ihr aktuelles Zoomlevel ist
					<span
						className={currentZoom < 6 ? "text-red font-bold" : "font-bold"}
					>
						&nbsp;{currentZoom}
					</span>
					.
				</span>
			</div>

			<div className="my-6 flex flex-wrap gap-2">
				{SCENARIOS.map((scenario) => (
					<Button
						key={scenario.id}
						variant={
							selectedScenario === scenario.configId ? "default" : "outline"
						}
						size="sm"
						onClick={() => setSelectedScenario(scenario.configId)}
						className="text-sm"
					>
						{scenario.icon}
						{scenario.label}
					</Button>
				))}
			</div>
		</div>
	);
};

export default ScenarioDisplay;
