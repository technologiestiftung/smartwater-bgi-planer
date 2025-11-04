"use client";

import BaselayerSwitch from "@/components/Map/BaselayerSwitch/BaselayerSwitch";
import GeolocationControl from "@/components/Map/Controls/MapNavigation/GeolocationControl";
import ZoomControl from "@/components/Map/Controls/MapNavigation/ZoomControl";
import { FC } from "react";

interface MapNavigationControlsProps {
	onGeolocate?: () => void;
}

const MapNavigationControls: FC<MapNavigationControlsProps> = ({
	onGeolocate,
}) => {
	return (
		<div className={`absolute bottom-6 left-4 z-10 flex flex-col gap-2`}>
			<GeolocationControl onGeolocate={onGeolocate} />
			<ZoomControl />
			<BaselayerSwitch />
		</div>
	);
};
export default MapNavigationControls;
