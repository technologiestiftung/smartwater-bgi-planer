import {
	CloudRainIcon,
	DropIcon,
	FishIcon,
	Icon,
	RoadHorizonIcon,
	ThermometerHotIcon,
} from "@phosphor-icons/react";

export const iconMap: Record<string, Icon> = {
	CloudRain: CloudRainIcon,
	ThermometerHot: ThermometerHotIcon,
	RoadHorizon: RoadHorizonIcon,
	Drop: DropIcon,
	Fish: FishIcon,
};

export function getIconComponent(iconName: string): Icon {
	const IconComponent = iconMap[iconName];
	if (!IconComponent) {
		console.warn(`Icon "${iconName}" not found in iconMap`);
		return CloudRainIcon;
	}
	return IconComponent;
}
