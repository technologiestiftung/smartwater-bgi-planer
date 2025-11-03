import { getLayerById } from "@/lib/helper/mapHelpers";
import { useMapStore } from "@/store/map";
import { Polygon } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { getArea } from "ol/sphere";
import { useEffect, useState } from "react";

export function useLayerArea(layerId: string) {
	const map = useMapStore((state) => state.map);
	const [formattedArea, setFormattedArea] = useState("0 m²");

	useEffect(() => {
		if (!map) return;

		const layer = getLayerById(map, layerId);
		if (!layer) return;

		const source = layer.getSource() as VectorSource;
		if (!source) return;

		const calculateArea = () => {
			let area = 0;
			source.getFeatures().forEach((feature) => {
				const geometry = feature.getGeometry();
				if (geometry instanceof Polygon) {
					area += getArea(geometry);
				}
			});

			setFormattedArea(
				area > 10000
					? `${Math.round((area / 1000000) * 100) / 100} km²`
					: `${Math.round(area * 100) / 100} m²`,
			);
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
	}, [map, layerId]);

	return { formattedArea };
}
