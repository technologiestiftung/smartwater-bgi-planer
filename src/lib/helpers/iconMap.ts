import {
	CheckSquareOffsetIcon,
	CloudRainIcon,
	DropIcon,
	FileMagnifyingGlassIcon,
	FishIcon,
	Icon,
	ListMagnifyingGlassIcon,
	RecycleIcon,
	RoadHorizonIcon,
	SolarRoofIcon,
	ThermometerHotIcon,
	TreeIcon,
	WallIcon,
	JarIcon,
} from "@phosphor-icons/react";

export const iconMap: Record<string, Icon> = {
	CloudRain: CloudRainIcon,
	ThermometerHot: ThermometerHotIcon,
	RoadHorizon: RoadHorizonIcon,
	Drop: DropIcon,
	Fish: FishIcon,
	Tree: TreeIcon,
	Recycle: RecycleIcon,
	SolarRoof: SolarRoofIcon,
	Wall: WallIcon,
	Check: CheckSquareOffsetIcon,
	File: FileMagnifyingGlassIcon,
	List: ListMagnifyingGlassIcon,
	Jar: JarIcon,
};

export const metricIconLabelMap: Record<string, string> = {
	CloudRain: "Starkregen",
	ThermometerHot: "Hitze",
	RoadHorizon: "Versiegelung",
	Drop: "Wasserhaushalt",
	Fish: "Gewässerschutz",
	Tree: "Begrünung",
	Jar: "Speicherung",
	Recycle: "Versickerung",
	File: "Potentiale",
};

export function getIconComponent(iconName: string): Icon {
	const IconComponent = iconMap[iconName];
	if (!IconComponent) {
		console.warn(`Icon "${iconName}" not found in iconMap`);
		return CloudRainIcon;
	}
	return IconComponent;
}
