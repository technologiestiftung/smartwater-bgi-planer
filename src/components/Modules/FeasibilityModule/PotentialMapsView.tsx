import { Button } from "@/components/ui/button";
import { CaretDoubleRightIcon } from "@phosphor-icons/react/dist/ssr";
import { FC, useState } from "react";

interface PotentialMapsViewProps {
	onBackToQuestions: () => void;
	description: string;
}

// Scenario options für die Umsetzung
const scenarios = [
	{ id: "simple", label: "einfache Umsetzung" },
	{ id: "common", label: "gängige Praxis" },
	{ id: "complex", label: "aufwendige Umsetzung" },
] as const;

// Maßnahmen options
const measures = [
	{ id: "surface_infiltration", label: "Flächenversickerung" },
	{ id: "swale_infiltration", label: "Muldenversickerung" },
	{ id: "swale_rigole", label: "Mulden-Rigolenelement" },
	{ id: "rigole_system", label: "Rigoleanlage" },
	{
		id: "swale_rigole_throttled",
		label: "Mulden-Rigolensystem mit gedrosselter Ableitung",
	},
] as const;

const PotentialMapsView: FC<PotentialMapsViewProps> = ({
	onBackToQuestions,
	description,
}) => {
	const [selectedScenario, setSelectedScenario] = useState<string>("simple");
	const [selectedMeasures, setSelectedMeasures] = useState<string[]>([
		"surface_infiltration",
	]);

	const toggleMeasure = (measureId: string) => {
		setSelectedMeasures((prev) =>
			prev.includes(measureId)
				? prev.filter((id) => id !== measureId)
				: [...prev, measureId],
		);
	};

	return (
		<div className="PotentialMapsView-root flex h-full w-full flex-col">
			<div className="flex-1 overflow-y-auto p-6">
				<p className="mt-2 text-sm text-gray-600">{description}</p>

				<p className="mb-6 text-sm text-gray-600">
					Hier sehen Sie die Potentialkarten der Maßnahmengruppen. Sie können
					nach einzelnen Maßnahmen filtern und eines der drei Szenarien
					auswählen. Klicken Sie auf eine Region in der Karte, um detaillierte
					Informationen und Attribute als Tooltip anzuzeigen.
				</p>

				{/* Scenario Selection */}
				<div className="mb-6">
					<h3 className="mb-3 font-semibold">Szenario auswählen</h3>
					<p className="mb-3 text-sm text-gray-600">
						Wählen Sie ein Szenario, um die Potentiale der Maßnahmen in
						unterschiedlichem Umsetzungsaufwand anzuzeigen.
					</p>
					<div className="flex flex-wrap gap-2">
						{scenarios.map((scenario) => (
							<Button
								key={scenario.id}
								variant={
									selectedScenario === scenario.id ? "default" : "outline"
								}
								size="sm"
								onClick={() => setSelectedScenario(scenario.id)}
								className="text-sm"
							>
								{scenario.label}
							</Button>
						))}
					</div>
				</div>

				{/* Measure Selection */}
				<div className="mb-6">
					<h3 className="mb-3 font-semibold">Maßnahme wählen</h3>
					<p className="mb-3 text-sm text-gray-600">
						Wählen Sie die Maßnahme aus, die Sie auf der Karte sehen möchten.
					</p>
					<div className="flex flex-wrap gap-2">
						{measures.map((measure) => (
							<Button
								key={measure.id}
								variant={
									selectedMeasures.includes(measure.id) ? "default" : "outline"
								}
								size="sm"
								onClick={() => toggleMeasure(measure.id)}
								className="flex-1 justify-start text-sm"
							>
								{measure.label}
							</Button>
						))}
					</div>
				</div>
			</div>

			{/* footer */}
			<div className="border-muted bg-secondary shrink-0 border-t p-4">
				<Button
					onClick={onBackToQuestions}
					className="text-md w-full text-white hover:text-white"
					size="lg"
					variant="ghost"
				>
					Weiter zu den Checkfragen der Maßnahmengruppe
					<CaretDoubleRightIcon />
				</Button>
			</div>
		</div>
	);
};

export default PotentialMapsView;
