"use client";

import BaselayerSwitch from "@/components/Map/BaselayerSwitch/BaselayerSwitch";
import ClickControl from "@/components/Map/Controls/ClickControl";
import MapNavigationControls from "@/components/Map/Controls/MapNavigation/MapNavigationControls";
import MapError from "@/components/Map/MapError/MapError";
import NoteCard from "@/components/NoteCard/NoteCard";
import { useMapStore } from "@/store/map";
import dynamic from "next/dynamic";
import { FC } from "react";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => <div>Loading map container...</div>,
});

const Map: FC = () => {
	const hasError = useMapStore((state) => state.hasError);
	const errorMessage = useMapStore((state) => state.errorMessage);
	const setMapError = useMapStore((state) => state.setMapError);

	const handleRetry = () => {
		setMapError(false);
		// Force re-initialization by reloading the page
		window.location.reload();
	};

	return (
		<div className="Map-root relative h-full w-full">
			<LazyOlMap>
				<BaselayerSwitch />
				<MapNavigationControls />
				<ClickControl layerId="module1_notes">
					<NoteCard />
				</ClickControl>
			</LazyOlMap>

			{hasError && (
				<MapError message={errorMessage || undefined} onRetry={handleRetry} />
			)}
		</div>
	);
};

export default Map;
