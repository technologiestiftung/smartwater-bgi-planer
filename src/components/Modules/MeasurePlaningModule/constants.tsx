import { StepConfig } from "@/components/VerticalStepper";
import { DropIcon, RoadHorizonIcon } from "@phosphor-icons/react";

export type MeasurePlaningSectionId = "planingA" | "planingB";

export const measurePlaningSteps: StepConfig[] = [
	{
		id: "planingA",
		icon: <DropIcon />,
		title: "Maßnahmenplanung A",
		questions: ["starter_question"],
	},
	{
		id: "planingB",
		icon: <RoadHorizonIcon />,
		title: "Maßnahmenplanung B",
		questions: ["starter_question"],
	},
];
