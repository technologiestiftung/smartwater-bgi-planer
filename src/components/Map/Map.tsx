"use client";

import dynamic from "next/dynamic";
import { FC } from "react";
import BaselayerSwitch from "./BaselayerSwitch/BaselayerSwitch";
import { MapControls } from "./Controls";
import MapNavigationControls from "./Controls/MapNavigation/MapNavigationControls";
import LayerInitializer from "./LayerInitializer/LayerInitializer";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => <div>Loading map container...</div>,
});

const Map: FC = () => {
	return (
		<div className="Map-root w-full h-full">
			<LazyOlMap>
				<LayerInitializer />
				<BaselayerSwitch />
				<MapControls>
					<MapNavigationControls />
				</MapControls>
			</LazyOlMap>
		</div>
	);
};

export default Map;
