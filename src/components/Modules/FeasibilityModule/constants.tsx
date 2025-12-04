import { StepConfig } from "@/components/VerticalStepper";
import { CloudRainIcon, ThermometerHotIcon } from "@phosphor-icons/react";

export const feasibilitySteps: StepConfig[] = [
	{
		id: "feasibilityA",
		icon: <CloudRainIcon />,
		title: "Machbarkeit A",
		questions: ["starter_question", "module_2_2"],
	},
	{
		id: "feasibilityB",
		icon: <ThermometerHotIcon />,
		title: "Machbarkeit B",
		questions: ["starter_question", "module_2_1"],
	},
];
