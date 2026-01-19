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
};

export function getIconComponent(iconName: string): Icon {
	const IconComponent = iconMap[iconName];
	if (!IconComponent) {
		console.warn(`Icon "${iconName}" not found in iconMap`);
		return CloudRainIcon;
	}
	return IconComponent;
}
