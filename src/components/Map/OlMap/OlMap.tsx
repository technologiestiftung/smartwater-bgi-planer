"use client";

import { useMapStore } from "@/store/map";
import Map from "ol/Map";
import View from "ol/View";
import { transform } from "ol/proj";
import React, { FC, useEffect, useRef } from "react";
import "../../../../node_modules/ol/ol.css";

interface OlMapProps {
	children?: React.ReactNode;
}

const OlMap: FC<OlMapProps> = ({ children }) => {
	const setMap = useMapStore((state) => state.populateMap);
	const destroyMap = useMapStore((state) => state.removeMap);
	const config = useMapStore((state) => state.config);
	const mapId = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!config) return;

		const mapViewConfig = config.portalConfig.map.mapView;

		const projection = mapViewConfig.epsg;
		let center = mapViewConfig.startCenter;

		// Check if coordinates are in WGS84 format (longitude/latitude)
		// and transform them to the target projection if needed
		if (
			center.length === 2 &&
			Math.abs(center[0]) <= 180 &&
			Math.abs(center[1]) <= 90
		) {
			center = transform(center, "EPSG:4326", projection);
		}

		// If coordinates are not in WGS84 format, assume they are already
		// in the target projection format and use them directly
		const resolutions = mapViewConfig.options
			.sort((a, b) => a.zoomLevel - b.zoomLevel)
			.map((option) => option.resolution);

		const startZoomLevel = Math.max(
			0,
			Math.min(mapViewConfig.startZoomLevel, resolutions.length - 1),
		);
		if (startZoomLevel !== mapViewConfig.startZoomLevel) {
			console.warn(
				`[OlMap] Start zoom level ${mapViewConfig.startZoomLevel} is out of range. Using ${startZoomLevel} instead.`,
			);
		}

		if (!mapId.current) {
			console.error("[OlMap] mapId.current is not defined");
			return;
		}

		try {
			const map = new Map({
				target: mapId.current,
				view: new View({
					center: center,
					zoom: startZoomLevel,
					projection: projection,
					smoothResolutionConstraint: false,
					constrainResolution: true,
					extent: mapViewConfig.extent,
					resolutions: resolutions,
					minZoom: 0,
					maxZoom: resolutions.length - 1,
				}),
			});

			setMap(map);

			return () => {
				if (map) {
					map.setTarget(undefined);
				}
				destroyMap();
			};
		} catch (error) {
			console.error("[OlMap] Error initializing map:", error);
		}
	}, [config, destroyMap, setMap]);

	return (
		<div ref={mapId} className="map w-full h-full bg-slate-300">
			{children}
		</div>
	);
};

export default OlMap;
