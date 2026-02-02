import { LineString, Polygon } from "ol/geom.js";
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
