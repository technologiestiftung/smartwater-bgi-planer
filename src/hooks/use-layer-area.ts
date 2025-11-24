import { getLayerById } from "@/lib/helpers/ol";
import { useMapStore } from "@/store/map";
import { MultiPolygon, Polygon } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { getArea } from "ol/sphere";
import { useEffect, useState } from "react";
import { useMapReady } from "./use-map-ready";

export function useLayerArea(layerId: string) {
	const map = useMapStore((state) => state.map);
	const isMapReady = useMapReady();
	const [formattedArea, setFormattedArea] = useState("0 m²");

	useEffect(() => {
		if (!map || !layerId || !isMapReady) return;

		const layer = getLayerById(map, layerId);
		if (!layer) return;

		const source = layer.getSource() as VectorSource;
		if (!source) return;

		const calculateArea = () => {
			let area = 0;
			const features = source.getFeatures();
			
			features.forEach((feature, index) => {
				const geometry = feature.getGeometry();
				if (geometry instanceof Polygon) {
					const featureArea = getArea(geometry);
					area += featureArea;
				} else if (geometry instanceof MultiPolygon) {
					const featureArea = getArea(geometry);
					area += featureArea;
				} else {
					console.warn(
						`[useLayerArea] ${layerId} - Feature ${index} is not a Polygon/MultiPolygon (type: ${geometry?.getType()}), skipping`,
					);
				}
			});

			const formattedAreaValue =
				area > 10000
					? `${Math.round((area / 1000000) * 100) / 100} km²`
					: `${Math.round(area * 100) / 100} m²`;

			setFormattedArea(formattedAreaValue);
		};

		calculateArea();
		source.on("addfeature", calculateArea);
		source.on("removefeature", calculateArea);
		source.on("changefeature", calculateArea);

		return () => {
			source.un("addfeature", calculateArea);
			source.un("removefeature", calculateArea);
			source.un("changefeature", calculateArea);
		};
	}, [map, layerId, isMapReady]);

	return { formattedArea };
}
