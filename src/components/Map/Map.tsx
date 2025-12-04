"use client";

import ClickControl from "@/components/Map/Controls/ClickControl";
import MapNavigationContainer from "@/components/Map/Controls/MapNavigation/MapNavigationContainer";
import NoteCard from "@/components/NoteCard/NoteCard";
import { Spinner } from "@/components/ui/spinner";
import { useMapReady } from "@/hooks/use-map-ready";
import { useMapStore } from "@/store";
import dynamic from "next/dynamic";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";
import OpacityControl from "./Controls/OpacityControl";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => null,
});

const Map: FC = () => {
	const isMapReady = useMapReady();
	const { hasError, errorMessage } = useMapStore(
		useShallow((state) => ({
			hasError: state.hasError,
			errorMessage: state.errorMessage,
		})),
	);

	return (
		<div className="Map-root relative h-full w-full">
			{!isMapReady && (
				<div className="bg-background/50 absolute top-0 right-0 bottom-0 left-0 flex flex-col items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<Spinner />
						<div className="text-sm text-gray-600">Karte wird geladen...</div>
						{hasError && (
							<div className="mt-2 max-w-sm rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
								{errorMessage || "Fehler beim Laden der Karte"}
							</div>
						)}
					</div>
				</div>
			)}
			<LazyOlMap>
				<MapNavigationContainer />
				<ClickControl layerId="module1_notes" minZoomForClick={0}>
					<NoteCard />
				</ClickControl>
				<OpacityControl />
			</LazyOlMap>
		</div>
	);
};

export default Map;
