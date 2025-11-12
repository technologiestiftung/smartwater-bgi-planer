import styleList from "@/config/resources/style";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import { Circle, Fill, Icon, Stroke, Style } from "ol/style";

interface StyleConfig {
	polygonStrokeWidth?: number;
	polygonStrokeColor?: number[];
	polygonFillColor?: number[];
	pointRadius?: number;
	pointFillColor?: number[];
	pointStrokeColor?: number[];
	pointStrokeWidth?: number;
	icon?: string;
	iconScale?: number;
}

export const getStyleConfig = (styleId: string): StyleConfig | null => {
	const styleConfig = styleList.find((s) => s.styleId === styleId);
	return styleConfig?.rules[0]?.style || null;
};

export const createOLStyle = (styleConfig: StyleConfig): Style | Style[] => {
	let imageStyle;

	if (styleConfig.icon) {
		imageStyle = new Icon({
			src: styleConfig.icon,
			scale: styleConfig.iconScale || 1,
			anchor: [0.5, 0.5],
			anchorXUnits: "fraction",
			anchorYUnits: "fraction",
		});
	} else {
		imageStyle = new Circle({
			radius: styleConfig.pointRadius || 5,
			fill: new Fill({
				color: styleConfig.pointFillColor || [255, 0, 0, 0.8],
			}),
			stroke: new Stroke({
				color: styleConfig.pointStrokeColor || [255, 0, 0, 1],
				width: styleConfig.pointStrokeWidth || 1,
			}),
		});
	}

	const styles = [
		new Style({
			fill: new Fill({
				color: styleConfig.polygonFillColor || [0, 0, 0, 0],
			}),
			stroke: new Stroke({
				color: styleConfig.polygonStrokeColor || [0, 0, 0, 1],
				width: styleConfig.polygonStrokeWidth || 1,
			}),
			image: imageStyle,
		}),
	];

	if (
		styleConfig.icon &&
		(styleConfig.pointFillColor || styleConfig.pointStrokeColor)
	) {
		styles.unshift(
			new Style({
				image: new Circle({
					radius: styleConfig.pointRadius || 12,
					fill: new Fill({
						color: styleConfig.pointFillColor || [255, 255, 255, 0.8],
					}),
					stroke: new Stroke({
						color: styleConfig.pointStrokeColor || [0, 0, 0, 1],
						width: styleConfig.pointStrokeWidth || 2,
					}),
				}),
			}),
		);
	}

	return styles.length === 1 ? styles[0] : styles;
};

export const applyStyleToLayer = (
	layer: VectorLayer<VectorSource>,
	styleId: string,
): boolean => {
	const styleConfig = getStyleConfig(styleId);
	if (!styleConfig) {
		console.warn(`Style with ID "${styleId}" not found`);
		return false;
	}

	const olStyle = createOLStyle(styleConfig);
	layer.setStyle(olStyle);
	return true;
};
