"use client";

import { BaselayerSwitch } from "@/components/Map/BaselayerSwitch/BaselayerSwitch";
import { GeolocationControl } from "@/components/Map/Controls/MapNavigation/GeolocationControl";
import { ZoomControl } from "@/components/Map/Controls/MapNavigation/ZoomControl";
import { LayerTree } from "@/components/Map/LayerTree/LayerTree";
import { useUiStore } from "@/store/ui";
import { FC, useCallback, useRef } from "react";
import { ProjectBoundaryControl } from "./ProjectBoundaryControl";
import { Tutorial } from "@/components/Tutorial/Tutorial";

interface MapNavigationContainerProps {
	onGeolocate?: () => void;
}

export const MapNavigationContainer: FC<MapNavigationContainerProps> = ({
	onGeolocate,
}) => {
	const setIsLayerTreeVisible = useUiStore(
		(state) => state.setIsLayerTreeVisible,
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
			setIsLayerTreeVisible(true);
		}, 300);
	}, [setIsLayerTreeVisible]);

	const handleMouseLeave = useCallback(() => {
		if (enterTimeoutRef.current) {
			clearTimeout(enterTimeoutRef.current);
			enterTimeoutRef.current = null;
		}
		if (leaveTimeoutRef.current) {
			clearTimeout(leaveTimeoutRef.current);
		}
		leaveTimeoutRef.current = window.setTimeout(() => {
			setIsLayerTreeVisible(false);
		}, 1500);
	}, [setIsLayerTreeVisible]);

	return (
		<div className="absolute bottom-6 left-4 z-20 flex items-end gap-2">
			<div className="flex flex-col gap-2">
				<ProjectBoundaryControl />
				<GeolocationControl onGeolocate={onGeolocate} />
				<ZoomControl />
				<div
					className="relative flex items-end gap-2"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					<Tutorial type="layerTree" />
					<BaselayerSwitch />
					<LayerTree />
				</div>
			</div>
		</div>
	);
};
