"use client";

import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/map";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import { transform } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { Icon, Style } from "ol/style";
import { FC, ReactNode, useCallback, useEffect, useRef } from "react";

interface GeolocationControlProps {
	geolocateIcon?: ReactNode;
	onGeolocate?: () => void;
}

// todo: fix icon display
const defaultLocationSvgString = `
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M12 12.75C13.6569 12.75 15 11.4069 15 9.75C15 8.09315 13.6569 6.75 12 6.75C10.3431 6.75 9 8.09315 9 9.75C9 11.4069 10.3431 12.75 12 12.75Z" stroke="#0C4C38" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
	<path d="M19.5 9.75C19.5 16.5 12 21.75 12 21.75C12 21.75 4.5 16.5 4.5 9.75C4.5 7.76088 5.29018 5.85322 6.6967 4.4467C8.10322 3.04018 10.0109 2.25 12 2.25C13.9891 2.25 15.8968 3.04018 17.3033 4.4467C18.7098 5.85322 19.5 7.76088 19.5 9.75Z" stroke="#0C4C38" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
	</svg>
`;

const GeolocationControl: FC<GeolocationControlProps> = ({
	geolocateIcon = (
		<div dangerouslySetInnerHTML={{ __html: defaultLocationSvgString }} />
	),
	onGeolocate,
}) => {
	const userLocationLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
	const map = useMapStore((state) => state.map);
	const setUserLocation = useMapStore((state) => state.setUserLocation);

	useEffect(() => {
		if (!map) return;

		const vectorSource = new VectorSource();
		const vectorLayer = new VectorLayer({
			source: vectorSource,
			style: new Style({
				image: new Icon({
					anchor: [0.5, 1],
					src:
						"data:image/svg+xml;charset=utf-8," +
						encodeURIComponent(defaultLocationSvgString),
					offset: [0, 0],
					opacity: 1,
					scale: 0.8,
				}),
			}),
			zIndex: 1000,
		});

		map.addLayer(vectorLayer);
		userLocationLayerRef.current = vectorLayer;

		return () => {
			if (userLocationLayerRef.current) {
				map.removeLayer(userLocationLayerRef.current);
			}
		};
	}, [map]);

	const handleGeolocate = useCallback(() => {
		if (onGeolocate) {
			onGeolocate();
			return;
		}

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					if (!map || !userLocationLayerRef.current) return;

					const view = map.getView();
					const projection = view.getProjection();

					// Transform coordinates from WGS84 to the map projection
					const coords = transform(
						[position.coords.longitude, position.coords.latitude],
						"EPSG:4326",
						projection,
					);

					setUserLocation({
						coordinates: coords as [number, number],
						accuracy: position.coords.accuracy,
					});

					const source = userLocationLayerRef.current.getSource();
					if (source) {
						source.clear();
						const feature = new Feature({
							geometry: new Point(coords),
						});
						source.addFeature(feature);
					}

					view.animate({
						center: coords,
						zoom: 16,
						duration: 1000,
					});
				},
				(error) => {
					console.error("Geolocation error:", error);
					setUserLocation({
						coordinates: null,
						accuracy: undefined,
					});
					if (userLocationLayerRef.current) {
						const source = userLocationLayerRef.current.getSource();
						if (source) {
							source.clear();
						}
					}
				},
				{
					enableHighAccuracy: true,
					timeout: 15000,
					maximumAge: 60000,
				},
			);
		} else {
			console.error("Geolocation is not supported by this browser.");
		}
	}, [map, onGeolocate, setUserLocation]);

	if (!map) return null;

	return (
		<Button
			variant="map-control"
			size="icon-only"
			onClick={handleGeolocate}
			className="cursor-pointer"
		>
			{geolocateIcon}
		</Button>
	);
};

export default GeolocationControl;
