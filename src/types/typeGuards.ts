import { Geometry, LineString, Point, Polygon } from "geojson";

export function isPoint(geometry: Geometry): geometry is Point {
	return geometry.type === "Point";
}

export function isLineString(geometry: Geometry): geometry is LineString {
	return geometry.type === "LineString";
}

export function isPolygon(geometry: Geometry): geometry is Polygon {
	return geometry.type === "Polygon";
}
