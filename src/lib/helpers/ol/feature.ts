import type Feature from "ol/Feature";
import type { Geometry } from "ol/geom";

export const getFeatureAttributes = (
	feature: Feature<Geometry> | undefined,
): Record<string, any> | null => {
	if (!feature?.getProperties) {
		return null;
	}

	return feature.getProperties();
};
