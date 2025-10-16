import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import VectorSource from "ol/source/Vector";

export const getLayerById = (map: Map | null, id: string) => {
	if (!map) return null;
	return map.getAllLayers().find((l) => l.get("id") === id) as
		| VectorLayer<VectorSource>
		| undefined;
};
