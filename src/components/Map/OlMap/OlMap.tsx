"use client";

import { useMapStore } from "@/store/map";
import { MapViewOption } from "@/store/map/types";
import Map from "ol/Map";
import View from "ol/View";
import React, { FC, useEffect, useRef } from "react";
import "../../../../node_modules/ol/ol.css";

interface OlMapProps {
	children?: React.ReactNode;
}

const OlMap: FC<OlMapProps> = ({ children }) => {
	const isInitializeReady = useMapStore((state) => state.isInitializeReady);
	const resetId = useMapStore((state) => state.resetId);
	const mapId = useRef<HTMLDivElement>(null);
	const mapView = useMapStore((state) => state.mapView);

	useEffect(() => {
		console.log("[OlMap] mapView::", mapView);
	}, [mapView]);

	useEffect(() => {
		if (!isInitializeReady) {
			return;
		}
		const config = useMapStore.getState().config;

		if (!config) {
			return;
		}

		console.log("[OlMap] OL MAP WIRD INITIALISIERT::");

		const mapViewConfig = config.portalConfig.map.mapView;

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
	}, [isInitializeReady, resetId]);

	return (
		<div ref={mapId} className="map h-full w-full bg-slate-300">
			{children}
		</div>
	);
};

export default OlMap;
