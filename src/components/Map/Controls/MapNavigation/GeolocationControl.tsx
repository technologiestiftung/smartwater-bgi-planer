"use client";

import { Button } from "@/components/ui/button";
import LocationIcon from "@/icons/mark.svg";
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

const locationSvgString = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h6a.75.75 0 000-1.5H12.75V6z" clip-rule="evenodd" />
  </svg>
`;

const GeolocationControl: FC<GeolocationControlProps> = ({
	geolocateIcon = <LocationIcon />,
	onGeolocate,
}) => {
	const map = useMapStore((state) => state.map);
	const setUserLocation = useMapStore((state) => state.setUserLocation);
	const userLocationLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

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
						encodeURIComponent(locationSvgString),
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
			variant="map-icon"
			size="icon-only"
			onClick={handleGeolocate}
			className="cursor-pointer"
		>
			{geolocateIcon}
		</Button>
	);
};

export default GeolocationControl;
