"use client";

import ClickControl from "@/components/Map/Controls/ClickControl";
import MapNavigationControls from "@/components/Map/Controls/MapNavigation/MapNavigationControls";
import NoteCard from "@/components/NoteCard/NoteCard";
import dynamic from "next/dynamic";
import { FC } from "react";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => <div>Loading map container...</div>,
});

const Map: FC = () => {
	return (
		<div className="Map-root relative h-full w-full">
			<LazyOlMap>
				<MapNavigationControls />
				<ClickControl layerId="module1_notes" minZoomForClick={0}>
					<NoteCard />
				</ClickControl>
			</LazyOlMap>
		</div>
	);
};

export default Map;
