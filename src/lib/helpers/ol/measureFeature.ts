import type Feature from "ol/Feature";
import type { Geometry } from "ol/geom";

export const resolveMeasureId = (
	feature: Feature<Geometry> | undefined,
): string | null => {
	if (!feature) {
		return null;
	}

	const directMeasureId = feature.get("measureId");
	if (directMeasureId) {
		return String(directMeasureId);
	}

	const featureProperties = feature.getProperties?.();
	if (featureProperties?.measureId) {
		return String(featureProperties.measureId);
	}

	const wrappedFeatures = feature.get("features");
	if (Array.isArray(wrappedFeatures) && wrappedFeatures.length === 1) {
		return resolveMeasureId(wrappedFeatures[0]);
	}

	return null;
};
