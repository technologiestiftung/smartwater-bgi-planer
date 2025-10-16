import { LineString, Polygon } from "ol/geom.js";
import VectorLayer from "ol/layer/Vector.js";
import Map from "ol/Map";
import { Vector as VectorSource } from "ol/source.js";
import { getArea, getLength } from "ol/sphere.js";

/**
 * Format area measurement for display
 */
export const formatArea = (polygon: Polygon): string => {
	const area = getArea(polygon);
	return area > 10000
		? Math.round((area / 1000000) * 100) / 100 + " km²"
		: Math.round(area * 100) / 100 + " m²";
};

/**
 * Format length measurement for display
 */
export const formatLength = (line: LineString): string => {
	const length = getLength(line);
	return length > 100
		? Math.round((length / 1000) * 100) / 100 + " km"
		: Math.round(length * 100) / 100 + " m";
};

/**
 * Find a vector layer by ID in the map
 */
export const findVectorLayerById = (
	map: Map,
	layerId: string,
): VectorLayer<VectorSource> | null => {
	const layer = map
		.getAllLayers()
		.find((l) => l.get("id") === layerId) as VectorLayer<VectorSource>;
	return layer || null;
};

/**
 * Create a measurement tooltip element
 */
export const createMeasurementTooltip = (): HTMLDivElement => {
	const measureDiv = document.createElement("div");
	measureDiv.className = "measure-tooltip";
	measureDiv.style.cssText =
		"background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #ccc; font-size: 12px; white-space: nowrap;";
	return measureDiv;
};
