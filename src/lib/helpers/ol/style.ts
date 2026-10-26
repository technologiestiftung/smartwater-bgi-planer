import { styleList } from "@/config/resources/style";
import { formatLength } from "@/lib/helpers/ol/format";
import type { MeasureGeometryType } from "@/types/measures";
import Feature, { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";
import MultiPolygon from "ol/geom/MultiPolygon";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import { Circle, Fill, Icon, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Text from "ol/style/Text";

// --- Types ---
interface StyleConfig {
	polygonStrokeWidth?: number;
	polygonStrokeColor?: number[] | string;
	polygonStrokeLineDash?: number[];
	polygonStrokeLineCap?: "butt" | "round" | "square";
	polygonStrokeLineJoin?: "bevel" | "round" | "miter";
	polygonFillColor?: number[] | string;
	pointRadius?: number;
	pointFillColor?: number[] | string;
	pointStrokeColor?: number[] | string;
	pointStrokeWidth?: number;
	icon?: string;
	iconScale?: number;
}

interface StyleRule {
	style: StyleConfig;
	conditions?: { properties?: Record<string, any> };
}

const STYLE_CACHE = new Map<string, Style | Style[]>();

export const DEFAULT_STYLE = new Style({
	stroke: new Stroke({ color: "#3b82f6", width: 2 }),
	fill: new Fill({ color: "rgba(59, 130, 246, 0.1)" }),
});

export const defaultDrawStyle = new Style({
	fill: new Fill({ color: "rgba(0, 153, 255, 0.1)" }),
	stroke: new Stroke({ color: "rgba(0, 153, 255, 1)", width: 2 }),
	image: new CircleStyle({
		radius: 5,
		fill: new Fill({ color: "rgba(0, 153, 255, 1)" }),
		stroke: new Stroke({ color: "#fff", width: 1.5 }),
	}),
});

// --- Helper: Logic Matcher ---
const matches = (
	feature: FeatureLike,
	conditions?: StyleRule["conditions"],
) => {
	if (!conditions?.properties) return true;
	return Object.entries(conditions.properties).every(([key, value]) => {
		const featVal = feature.get(key);
		if (Array.isArray(value)) {
			const [min, max] = [Math.min(...value), Math.max(...value)];
			return typeof featVal === "number" && featVal >= min && featVal < max;
		}
		return featVal === value;
	});
};

// --- Helper: Style Creator ---
export const createOLStyle = (config: StyleConfig): Style | Style[] => {
	const key = JSON.stringify(config);
	if (STYLE_CACHE.has(key)) return STYLE_CACHE.get(key)!;

	const {
		icon,
		iconScale = 1,
		pointRadius = 5,
		pointFillColor,
		pointStrokeColor,
		pointStrokeWidth = 1,
		polygonFillColor = [0, 0, 0, 0],
		polygonStrokeColor = [0, 0, 0, 1],
		polygonStrokeWidth = 1,
		polygonStrokeLineDash,
		polygonStrokeLineCap,
		polygonStrokeLineJoin,
	} = config;

	const mainStyle = new Style({
		fill: new Fill({ color: polygonFillColor }),
		stroke: new Stroke({
			color: polygonStrokeColor,
			width: polygonStrokeWidth,
			lineDash: polygonStrokeLineDash,
			lineCap: polygonStrokeLineCap,
			lineJoin: polygonStrokeLineJoin,
		}),
		image: icon
			? new Icon({
					src: icon,
					scale: iconScale,
					color: pointFillColor as any,
					anchor: [0.5, 0.5],
					crossOrigin: "anonymous",
				})
			: new Circle({
					radius: pointRadius,
					fill: new Fill({ color: pointFillColor || [255, 0, 0, 0.8] }),
					stroke: new Stroke({
						color: pointStrokeColor || [255, 0, 0, 1],
						width: pointStrokeWidth,
					}),
				}),
	});

	const hasBackground = !!(
		icon &&
		(config.pointFillColor || config.pointStrokeColor)
	);

	const result = hasBackground
		? [
				new Style({
					image: new Circle({
						radius: pointRadius,
						fill: new Fill({ color: pointFillColor || [255, 255, 255, 0.8] }),
						stroke: new Stroke({
							color: pointStrokeColor || [0, 0, 0, 1],
							width: pointStrokeWidth,
						}),
					}),
				}),
				mainStyle,
			]
		: mainStyle;

	STYLE_CACHE.set(key, result);
	return result;
};

const BADGE_PRIMARY = "#0c4c38";
const BADGE_WHITE = "#ffffff";
const BADGE_OFFSET = 22;
const BADGE_STYLE_CACHE = new Map<string, Style>();

let badgeFontFamily: string | undefined;
const getBadgeFont = () => {
	badgeFontFamily ??=
		typeof document === "undefined"
			? "sans-serif"
			: getComputedStyle(document.body).fontFamily || "sans-serif";
	return `500 12px ${badgeFontFamily}`;
};

const BADGE_RADIUS = 11;
const BADGE_STROKE = 2;

const createBadgeCanvas = (
	badge: string,
	font: string,
	[fill, ring, ink]: string[],
) => {
	const dpr = window.devicePixelRatio || 1;
	const size = BADGE_RADIUS * 2 + BADGE_STROKE;
	const center = size / 2;
	const canvas = document.createElement("canvas");
	canvas.width = size * dpr;
	canvas.height = size * dpr;
	const ctx = canvas.getContext("2d");
	if (!ctx) return canvas;

	ctx.scale(dpr, dpr);
	ctx.beginPath();
	ctx.arc(center, center, BADGE_RADIUS, 0, 2 * Math.PI);
	ctx.fillStyle = fill;
	ctx.fill();
	ctx.lineWidth = BADGE_STROKE;
	ctx.strokeStyle = ring;
	ctx.stroke();

	ctx.font = font;
	ctx.textAlign = "left";
	ctx.textBaseline = "alphabetic";
	const m = ctx.measureText(badge);
	ctx.fillStyle = ink;
	ctx.fillText(
		badge,
		center - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2,
		center + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
	);
	return canvas;
};

// Polygons: draw the badge at the interior point (circle images need a point)
const badgeGeometry = (feature: FeatureLike) => {
	const geometry = feature.getGeometry();
	if (geometry instanceof Polygon) return geometry.getInteriorPoint();
	if (geometry instanceof MultiPolygon) return geometry.getInteriorPoints();
	return geometry;
};

const getBadgeStyle = (
	badge: string,
	isPoint: boolean,
	isConnectedArea: boolean,
) => {
	const key = `${badge}:${isPoint}:${isConnectedArea}`;
	if (!BADGE_STYLE_CACHE.has(key)) {
		const font = getBadgeFont();
		const colors = isConnectedArea
			? [BADGE_WHITE, BADGE_PRIMARY, BADGE_PRIMARY]
			: [BADGE_PRIMARY, BADGE_WHITE, BADGE_WHITE];
		const dpr = window.devicePixelRatio || 1;
		const style = new Style({
			geometry: badgeGeometry,
			image: new Icon({
				img: createBadgeCanvas(badge, font, colors),
				scale: 1 / dpr,
				displacement: [0, isPoint ? BADGE_OFFSET : 0],
			}),
			zIndex: Infinity,
		});
		// Don't cache a badge drawn with the fallback font before Arthouse loaded
		if (!document.fonts.check(font)) return style;
		BADGE_STYLE_CACHE.set(key, style);
	}
	return BADGE_STYLE_CACHE.get(key)!;
};

export const withBadge = (feature: FeatureLike, style: Style | Style[]) => {
	const badge = feature.get("badge") as string | undefined;
	if (!badge) return style;
	const isPoint = feature.getGeometry()?.getType() === "Point";
	const isConnectedArea = !!feature.get("connectedAreaId");
	return [style, getBadgeStyle(badge, isPoint, isConnectedArea)].flat();
};

/**
 * Automatically applies static or conditional styles.
 * Returns boolean to satisfy your layer factory.
 */
export const applyStyleToLayer = (
	layer: VectorLayer<VectorSource>,
	styleId: string,
): boolean => {
	const entry = styleList.find((s: any) => s.styleId === styleId);
	if (!entry) return false;

	const isConditional = entry.rules.some((r: any) => r.conditions);

	if (isConditional) {
		layer.setStyle((feature) => {
			const rule = entry.rules.find((r: any) => matches(feature, r.conditions));
			return withBadge(
				feature,
				rule ? createOLStyle(rule.style as StyleConfig) : DEFAULT_STYLE,
			);
		});
	} else {
		const style = createOLStyle(entry.rules[0].style as StyleConfig);
		layer.setStyle((feature) => withBadge(feature, style));
	}

	return true;
};

export const getDrawStyle = (geometryType: MeasureGeometryType) =>
	geometryType !== "Polygon"
		? undefined
		: (feature: FeatureLike) => {
				const geometry =
					feature instanceof Feature ? feature.getGeometry() : null;
				return geometry instanceof Polygon
					? [defaultDrawStyle, ...getSegmentLabelStyles(geometry)]
					: [defaultDrawStyle];
			};

export const getSegmentLabelStyles = (polygon: Polygon) => {
	const ring = polygon.getCoordinates()[0] || [];
	const segmentStyles: Style[] = [];

	for (let index = 0; index < ring.length - 1; index++) {
		const start = ring[index];
		const end = ring[index + 1];
		const segment = new LineString([start, end]);
		const midpoint: [number, number] = [
			(start[0] + end[0]) / 2,
			(start[1] + end[1]) / 2,
		];

		segmentStyles.push(
			new Style({
				geometry: new Point(midpoint),
				text: new Text({
					text: formatLength(segment),
					font: "400 12px sans-serif",
					padding: [2, 4, 2, 4],
					fill: new Fill({ color: "rgba(17, 24, 39, 0.9)" }),
					backgroundFill: new Fill({ color: "rgba(255, 255, 255, 0.5)" }),
				}),
			}),
		);
	}

	return segmentStyles;
};
