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
			<div className="relative">
				<GeolocationControl onGeolocate={onGeolocate} />
			</div>
			<div className="relative">
				<ZoomControl />
			</div>
		</div>
	);
};
export default MapNavigationControls;
