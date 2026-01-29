"use client";

import ClickControl from "@/components/Map/Controls/ClickControl";
import MapNavigationContainer from "@/components/Map/Controls/MapNavigation/MapNavigationContainer";
import { Spinner } from "@/components/ui/spinner";
import { useClickControlConfig } from "@/hooks/use-click-control-config";
import { useMapReady } from "@/hooks/use-map-ready";
import { useMapStore } from "@/store";
import dynamic from "next/dynamic";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";
import OpacityControl from "./Controls/OpacityControl";
import MapFooter from "./MapFooter/MapFooter";

const LazyOlMap = dynamic(() => import("./OlMap/OlMap"), {
	ssr: false,
	loading: () => null,
});

const Map: FC = () => {
	const isMapReady = useMapReady();
	const { hasMapError, errorMessage } = useMapStore(
		useShallow((state) => ({
			hasMapError: state.hasMapError,
			errorMessage: state.errorMessage,
		})),
	);
	const {
		layerIds,
		vectorLayerIds,
		wmsLayerIds,
		renderContent,
		currentConfig,
	} = useClickControlConfig();

	return (
		<div className="Map-root relative h-full w-full">
			{!isMapReady && (
				<div className="bg-background/50 absolute top-0 right-0 bottom-0 left-0 flex flex-col items-center justify-center">
					<div>
						{hasMapError ? (
							<div className="bg-destructive/10 border-destructive flex flex-col gap-2 border-2 border-dashed p-4 text-center">
								{errorMessage || "Fehler beim Laden der Karte"}
							</div>
						) : (
							<div className="flex flex-col items-center gap-3">
								<Spinner />
								<div className="text-sm text-gray-600">
									Karte wird geladen...
								</div>
							</div>
						)}
					</div>
				</div>
			)}
			<LazyOlMap>
				<MapNavigationContainer />
				<ClickControl
					layerIds={layerIds}
					vectorLayerIds={vectorLayerIds}
					wmsLayerIds={wmsLayerIds}
					currentConfig={currentConfig}
					minZoomForClick={0}
					renderContent={renderContent}
				/>
				<OpacityControl />
				<MapFooter />
			</LazyOlMap>
		</div>
	);
};
export default Map;
