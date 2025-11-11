"use client";

import AdditionalLayerTree from "@/components/Map/AdditinalLayerTree/AdditionalLayerTree";
import BaselayerSwitch from "@/components/Map/BaselayerSwitch/BaselayerSwitch";
import GeolocationControl from "@/components/Map/Controls/MapNavigation/GeolocationControl";
import ZoomControl from "@/components/Map/Controls/MapNavigation/ZoomControl";
import { FC } from "react";

interface MapNavigationContainerProps {
	onGeolocate?: () => void;
}

const MapNavigationContainer: FC<MapNavigationContainerProps> = ({
	onGeolocate,
}) => {
	return (
		<div className="absolute bottom-6 left-4 z-10 flex items-end gap-2">
			<div className="flex flex-col gap-2">
				<GeolocationControl onGeolocate={onGeolocate} />
				<ZoomControl />
				<BaselayerSwitch />
			</div>
			<div className="flex">
				<AdditionalLayerTree />
			</div>
		</div>
	);
};
export default MapNavigationContainer;
