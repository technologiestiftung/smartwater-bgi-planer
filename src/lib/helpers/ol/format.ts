import { LineString, Polygon } from "ol/geom";
import { formatNumber } from "@/lib/helpers/common";

/**
 * Format area measurement for display.
 * Uses the geometry's planimetric area (units of the map projection, EPSG:25833 → m²).
 */
export const formatArea = (polygon: Polygon): string => {
	const area = polygon.getArea();
	return area > 10000
		? formatNumber(area / 1000000) + " km²"
		: formatNumber(area) + " m²";
};

/**
 * Format length measurement for display.
 * Uses the geometry's planimetric length (units of the map projection, EPSG:25833 → m).
 */
export const formatLength = (line: LineString): string => {
	const length = line.getLength();
	return length > 100
		? formatNumber(length / 1000) + " km"
		: formatNumber(length) + " m";
};
