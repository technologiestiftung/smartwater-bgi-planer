import { styleList } from "@/config/resources/style";
import { formatLength } from "@/lib/helpers/ol/format";
import type { MeasureGeometryType } from "@/types/measures";
import Feature, { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";
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
	} = config;

	const mainStyle = new Style({
		fill: new Fill({ color: polygonFillColor }),
		stroke: new Stroke({
			color: polygonStrokeColor,
			width: polygonStrokeWidth,
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
			return rule ? createOLStyle(rule.style) : DEFAULT_STYLE;
		});
	} else {
		layer.setStyle(createOLStyle(entry.rules[0].style));
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
