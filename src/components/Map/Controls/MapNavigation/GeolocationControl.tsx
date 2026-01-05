"use client";

import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/map";
import Image from "next/image";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import { transform } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { Icon, Style } from "ol/style";
import { FC, useCallback, useEffect, useRef } from "react";

interface GeolocationControlProps {
	onGeolocate?: () => void;
}

const GeolocationControl: FC<GeolocationControlProps> = ({ onGeolocate }) => {
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
					src: "/icons/mapPin.svg",
					scale: 1,
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
			<Image src="/icons/mapPin.svg" alt="Geolocate" width={24} height={24} />
		</Button>
	);
};

export default GeolocationControl;
