"use client";

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
		<div className={`absolute right-4 bottom-10 z-10 flex flex-col gap-2`}>
			<GeolocationControl onGeolocate={onGeolocate} />
			<ZoomControl />
		</div>
	);
};
export default MapNavigationControls;
