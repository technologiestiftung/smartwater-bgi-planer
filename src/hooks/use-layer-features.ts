"use client";

import { getLayerById } from "@/lib/helpers/ol";
import { useMapStore } from "@/store/map";
import VectorSource from "ol/source/Vector";
import { useEffect, useState } from "react";
import { useMapReady } from "./use-map-ready";

export function useLayerFeatures(layerId: string) {
	const map = useMapStore((state) => state.map);
	const isMapReady = useMapReady();
	const [hasFeatures, setHasFeatures] = useState(false);

	useEffect(() => {
		if (!map || !layerId || !isMapReady) return;

		const layer = getLayerById(map, layerId);
		if (!layer) return;

		const source = layer.getSource() as VectorSource;
		if (!source) return;

		const checkFeatures = () => {
			const featureCount = source.getFeatures().length;
			setHasFeatures(featureCount > 0);
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
	}, [map, layerId, isMapReady]);

	return { hasFeatures };
}
