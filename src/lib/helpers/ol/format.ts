import { LineString, Polygon } from "ol/geom";

/**
 * Format area measurement for display.
 * Uses the geometry's planimetric area (units of the map projection, EPSG:25833 → m²).
 */
export const formatArea = (polygon: Polygon): string => {
	const area = polygon.getArea();
	return area > 10000
		? Math.round((area / 1000000) * 100) / 100 + " km²"
		: Math.round(area * 100) / 100 + " m²";
};

/**
 * Format length measurement for display.
 * Uses the geometry's planimetric length (units of the map projection, EPSG:25833 → m).
 */
export const formatLength = (line: LineString): string => {
	const length = line.getLength();
	return length > 100
		? Math.round((length / 1000) * 100) / 100 + " km"
		: Math.round(length * 100) / 100 + " m";
};
