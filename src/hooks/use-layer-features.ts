import { getLayerById } from "@/lib/helper/mapHelpers";
import { useMapStore } from "@/store/map";
import VectorSource from "ol/source/Vector";
import { useEffect, useState } from "react";

export function useLayerFeatures(layerId: string) {
	const map = useMapStore((state) => state.map);
	const [hasFeatures, setHasFeatures] = useState(false);

	useEffect(() => {
		if (!map) return;

		const layer = getLayerById(map, layerId);
		if (!layer) return;

		const source = layer.getSource() as VectorSource;
		if (!source) return;

		const checkFeatures = () => {
			setHasFeatures(source.getFeatures().length > 0);
		};

		checkFeatures();
		source.on("addfeature", checkFeatures);
		source.on("removefeature", checkFeatures);
		source.on("clear", checkFeatures);

		return () => {
			source.un("addfeature", checkFeatures);
			source.un("removefeature", checkFeatures);
			source.un("clear", checkFeatures);
		};
	}, [map, layerId]);

	return { hasFeatures };
}
