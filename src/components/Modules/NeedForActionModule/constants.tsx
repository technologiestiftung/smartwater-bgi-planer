import { StepConfig } from "@/components/VerticalStepper";
import {
	CloudRainIcon,
	DropIcon,
	FishIcon,
	RoadHorizonIcon,
	ThermometerHotIcon,
} from "@phosphor-icons/react";

export const needForActionSteps: StepConfig[] = [
	{
		id: "heavyRain",
		icon: <CloudRainIcon />,
		title: "Starkregen",
		questions: [
			"starter_question",
			"heavy_rain_flow_velocity",
			"heavy_rain_water_level",
			"heavy_rain_fire_department_incidents",
		],
	},
	{
		id: "heat",
		icon: <ThermometerHotIcon />,
		title: "Hitze",
		questions: [
			"heat_thermal_load_day",
			"heat_thermal_load_night",
			"heat_vulnerable_areas",
			"heat_cold_air_corridors",
			"heat_air_exchange_corridors",
			"heat_cold_air_flow",
		],
	},
	{
		id: "sealing",
		icon: <RoadHorizonIcon />,
		title: "Versiegelung",
		questions: [
			"sealing_block_areas_high",
			"sealing_green_volume_low",
			"sealing_small_scale_high",
		],
	},
	{
		id: "waterBalance",
		icon: <DropIcon />,
		title: "Wasserhaushalt",
		questions: ["water_balance_natural_deviation"],
	},
	{
		id: "waterProtection",
		icon: <FishIcon />,
		title: "Gewässerschutz",
		questions: [
			"water_protection_sewer_type",
			"water_protection_decoupling_requirements",
			"water_protection_small_waters_demand",
		],
	},
];
