"use client";

import AdditionalLayerTree from "@/components/Map/AdditionalLayerTree/AdditionalLayerTree";
import BaselayerSwitch from "@/components/Map/BaselayerSwitch/BaselayerSwitch";
import GeolocationControl from "@/components/Map/Controls/MapNavigation/GeolocationControl";
import ZoomControl from "@/components/Map/Controls/MapNavigation/ZoomControl";
import { useUiStore } from "@/store/ui";
import { FC, useCallback, useRef } from "react";
import ProjectBoundaryControl from "./ProjectBoundaryControl";

interface MapNavigationContainerProps {
	onGeolocate?: () => void;
}

const MapNavigationContainer: FC<MapNavigationContainerProps> = ({
	onGeolocate,
}) => {
	const setIsAdditionalLayerTreeVisible = useUiStore(
		(state) => state.setIsAdditionalLayerTreeVisible,
	);
	const enterTimeoutRef = useRef<number | null>(null);
	const leaveTimeoutRef = useRef<number | null>(null);

	const handleMouseEnter = useCallback(() => {
		if (leaveTimeoutRef.current) {
			clearTimeout(leaveTimeoutRef.current);
			leaveTimeoutRef.current = null;
		}
		if (enterTimeoutRef.current) {
			clearTimeout(enterTimeoutRef.current);
		}
		enterTimeoutRef.current = window.setTimeout(() => {
			setIsAdditionalLayerTreeVisible(true);
		}, 300);
	}, [setIsAdditionalLayerTreeVisible]);

	const handleMouseLeave = useCallback(() => {
		if (enterTimeoutRef.current) {
			clearTimeout(enterTimeoutRef.current);
			enterTimeoutRef.current = null;
		}
		if (leaveTimeoutRef.current) {
			clearTimeout(leaveTimeoutRef.current);
		}
		leaveTimeoutRef.current = window.setTimeout(() => {
			setIsAdditionalLayerTreeVisible(false);
		}, 1000);
	}, [setIsAdditionalLayerTreeVisible]);

	return (
		<div className="absolute bottom-6 left-4 z-10 flex items-end gap-2">
			<div className="flex flex-col gap-2">
				<ProjectBoundaryControl />
				<GeolocationControl onGeolocate={onGeolocate} />
				<ZoomControl />
				<div
					className="relative flex items-end gap-2"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					<BaselayerSwitch />
					<AdditionalLayerTree />
				</div>
			</div>
		</div>
	);
};
export default MapNavigationContainer;
