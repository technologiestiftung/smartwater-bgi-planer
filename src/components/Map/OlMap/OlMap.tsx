"use client";

import { useMapStore } from "@/store/map";
import Map from "ol/Map";
import View from "ol/View";
import React, { FC, useEffect, useRef } from "react";
import "../../../../node_modules/ol/ol.css";

interface OlMapProps {
	children?: React.ReactNode;
}

const OlMap: FC<OlMapProps> = ({ children }) => {
	const isConfigReady = useMapStore((state) => state.isConfigReady);
	const resetId = useMapStore((state) => state.resetId);
	const mapId = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isConfigReady) {
			return;
		}

		const config = useMapStore.getState().config;

		if (!config) {
			return;
		}

		const mapViewConfig = config.portalConfig.map.mapView;

		interface MapViewOption {
			zoomLevel: number;
			resolution: number;
		}

		const resolutions: number[] = [...mapViewConfig.options]
			.sort((a: MapViewOption, b: MapViewOption) => a.zoomLevel - b.zoomLevel)
			.map((option: MapViewOption) => option.resolution);

		if (!mapId.current) {
			console.error("[OlMap] mapId.current is not defined");
			return;
		}

		try {
			const map = new Map({
				target: mapId.current,
				view: new View({
					center: mapViewConfig.startCenter,
					zoom: mapViewConfig.startZoomLevel,
					projection: mapViewConfig.epsg,
					smoothResolutionConstraint: false,
					constrainResolution: true,
					extent: mapViewConfig.extent,
					resolutions: resolutions,
					minZoom: 0,
					maxZoom: resolutions.length - 1,
				}),
			});

			useMapStore.getState().populateMap(map);

			return () => {
				if (map) {
					map.setTarget(undefined);
				}
				useMapStore.getState().removeMap();
			};
		} catch (error) {
			console.error("[OlMap] Error initializing map:", error);
			useMapStore
				.getState()
				.setMapError(true, "Fehler beim Initialisieren der Karte");
		}
	}, [isConfigReady, resetId]);

	return (
		<div ref={mapId} className="map h-full w-full bg-slate-300">
			{children}
		</div>
	);
};

export default OlMap;
