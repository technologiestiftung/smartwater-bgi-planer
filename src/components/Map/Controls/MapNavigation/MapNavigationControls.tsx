"use client";

import { FC } from "react";
import GeolocationControl from "./GeolocationControl";
import ZoomControl from "./ZoomControl";

interface MapNavigationControlsProps {
	onGeolocate?: () => void;
}

const MapNavigationControls: FC<MapNavigationControlsProps> = ({
	onGeolocate,
}) => {
	return (
		<div className={`absolute bottom-10 right-4 flex flex-col gap-2 z-10`}>
			<GeolocationControl onGeolocate={onGeolocate} />
			<ZoomControl />
		</div>
	);
};
export default MapNavigationControls;
