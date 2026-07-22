import type Feature from "ol/Feature";
import type { Geometry } from "ol/geom";
import type VectorLayer from "ol/layer/Vector";
import type Map from "ol/Map";
import type { Vector as VectorSource } from "ol/source";

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

export const removeMeasureFeatureFromLayer = (
	map: Map,
	drawLayerId: string | null,
	measureId: string,
) => {
	if (!drawLayerId) return;

	const layer = map.getAllLayers().find((l) => l.get("id") === drawLayerId) as
		VectorLayer<VectorSource> | undefined;
	const source = layer?.getSource();
	if (!source) return;

	const measureFeature = source
		.getFeatures()
		.find((f) => f.get("measureId") === measureId);
	if (measureFeature) {
		source.removeFeature(measureFeature);
		source.changed();
	}
};
