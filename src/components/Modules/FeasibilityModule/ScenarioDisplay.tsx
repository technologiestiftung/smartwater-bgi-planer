"use client";

import { Button } from "@/components/ui/button";
import { FC, useEffect, useState } from "react";

interface ScenarioDisplayProps {}

const SCENARIOS = [
	{
		id: 1,
		label: "einfache Umsetzung",
		configId: "2V1",
	},
	{
		id: 2,
		label: "gängige Praxis",
		configId: "2V1.1",
	},
	{
		id: 3,
		label: "aufwendige Umsetzung",
		configId: "2V1.2",
	},
];

const ScenarioDisplay: FC<ScenarioDisplayProps> = ({}) => {
	const [selectedScenario, setSelectedScenario] = useState(1);

	useEffect(() => {
		console.log("[ScenarioDisplay] ::", selectedScenario);
	}, [selectedScenario]);

	return (
		<div className="ScenarioDisplay-root">
			<p className="mb-2 font-semibold">Szenario auswählen</p>
			<div className="mb-2 wrap-break-word">
				Wählen Sie ein Szenario, um die Potenziale der Maßnahmen in
				unterschiedlichem Umsetzungsaufwand anzuzeigen.
			</div>

			<div className="flex flex-wrap gap-2">
				{SCENARIOS.map((scenario) => (
					<Button
						key={scenario.id}
						variant={"outline"}
						size="sm"
						onClick={() => setSelectedScenario(scenario.id)}
						className="text-sm"
					>
						{scenario.label}
					</Button>
				))}
			</div>
		</div>
	);
};

export default ScenarioDisplay;
