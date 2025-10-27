"use client";

import dynamic from "next/dynamic";
import { FC } from "react";
import { MapControls } from "./Controls";
import MapNavigationControls from "./Controls/MapNavigation/MapNavigationControls";
import LayerInitializer from "./LayerInitializer/LayerInitializer";
import LayerTree from "./LayerTree/LayerTree";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => <div>Loading map container...</div>,
});

const Map: FC = () => {
	return (
		<div className="Map-root h-full w-full">
			<LazyOlMap>
				<LayerInitializer />
				<LayerTree />
				<MapControls>
					<MapNavigationControls />
				</MapControls>
			</LazyOlMap>
		</div>
	);
};

export default Map;
