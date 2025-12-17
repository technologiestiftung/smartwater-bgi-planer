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
	const config = useMapStore((state) => state.config);
	const isConfigReady = useMapStore((state) => state.isConfigReady);
	const mapId = useRef<HTMLDivElement>(null);
	const hasInitialized = useRef(false);

	useEffect(() => {
		if (!isConfigReady || !config || hasInitialized.current) {
			console.log(
				"[OlMap] Early return - isConfigReady:",
				isConfigReady,
				"config:",
				!!config,
				"hasInitialized:",
				hasInitialized.current,
			);
			return;
		}

		console.log("[OlMap] Initializing map");
		hasInitialized.current = true;

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
			hasInitialized.current = false;
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
			console.log("[OlMap] Map created and set in store");

			return () => {
				console.log("[OlMap] Cleanup: destroying map");
				if (map) {
					map.setTarget(undefined);
				}
				useMapStore.getState().removeMap();
				hasInitialized.current = false;
			};
		} catch (error) {
			console.error("[OlMap] Error initializing map:", error);
			useMapStore
				.getState()
				.setMapError(true, "Fehler beim Initialisieren der Karte");
			hasInitialized.current = false;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConfigReady]);

	return (
		<div ref={mapId} className="map h-full w-full bg-slate-300">
			{children}
		</div>
	);
};

export default OlMap;
