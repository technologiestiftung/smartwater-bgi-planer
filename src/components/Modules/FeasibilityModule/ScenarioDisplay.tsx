"use client";

import { Button } from "@/components/ui/button";
import { useLayersStore } from "@/store";
import { useMapStore } from "@/store/map";
import {
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
		<div className="ScenarioDisplay-root">
			<p className="mb-2 font-semibold">Szenario auswählen</p>
			<div className="mb-2 wrap-break-word">
				Wählen Sie ein Szenario, um die Potenziale der Maßnahmen in
				unterschiedlichem Umsetzungsaufwand anzuzeigen.
			</div>

			<div className="mb-2 wrap-break-word">
				Bitte beachten Sie, dass Sie zum Darstellen der Karten ein Zoomlevel von
				mindestens 6 haben. Ihr aktuelles Zoomlevel ist {currentZoom}.
			</div>

			<div className="mb-4 flex flex-wrap gap-2">
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
