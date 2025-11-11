import styleList from "@/config/resources/style";
import { getFileName } from "@/lib/helpers/file";
import { getLayerById } from "@/lib/helpers/ol/map";
import { LayerElementBase, LayerFolder } from "@/store/layers/types";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import type Map from "ol/Map";
import { Vector as VectorSource } from "ol/source";
import { Circle, Fill, Icon, Stroke, Style } from "ol/style";

export type LayerTreeElement = LayerElementBase | LayerFolder;

export interface WMSValidationResult {
	isValid: boolean;
	error?: string;
	hasLayers?: boolean;
}

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

/**
 * Validates whether a given URL string refers to a WMS service.
 * @param {string} url The URL string to validate.
 * @returns {WMSValidationResult} An object containing information about the validation result.
 * @throws {Error} If the given URL string is invalid.
 */
export const validateWMSUrl = (url: string): WMSValidationResult => {
	try {
		const parsedUrl = new URL(url);

		const urlString = parsedUrl.toString().toLowerCase();
		const hasWmsIndicator =
			urlString.includes("wms") ||
			urlString.includes("service=wms") ||
			parsedUrl.searchParams.get("service")?.toLowerCase() === "wms";

		if (!hasWmsIndicator) {
			return { isValid: false, error: "URL scheint kein WMS Service zu sein" };
		}
		return { isValid: true };
	} catch {
		return { isValid: false, error: "Ungültige URL" };
	}
};

/**
 * Get layer IDs in a folder.
 * @param {folderElements} A list of layer elements.
 * @param {folderName} The name of the folder.
 * @param {foundIds} A set of layer ids.
 * @return {Set<string>} A set of layer ids.
 */
export function getLayerIdsInFolder(
	folderElements: LayerTreeElement[],
	folderName: string,
	foundIds: Set<string> = new Set(),
): Set<string> {
	folderElements.forEach((item) => {
		if (item.type === "folder") {
			if (item.name === folderName) {
				const flattenFolderChildren = (children: LayerTreeElement[]) => {
					children.forEach((child) => {
						if (child.type === "folder") {
							flattenFolderChildren(child.elements);
						} else if ("id" in child) {
							foundIds.add(child.id);
						}
					});
				};
				flattenFolderChildren(item.elements);
			} else {
				getLayerIdsInFolder(item.elements ?? [], folderName, foundIds);
			}
		}
	});
	return foundIds;
}

/**
 * @param {map} Map
 * @param {layerId} string
 * @return {VectorLayer<VectorSource> | undefined}
 */
export const ensureVectorLayer = (
	map: Map,
	layerId: string,
): VectorLayer<VectorSource> => {
	let layer = getLayerById(map, layerId) as
		| VectorLayer<VectorSource>
		| undefined;

	if (!layer) {
		const source = new VectorSource();
		layer = new VectorLayer({ source });
		layer.set("id", layerId);
		map.addLayer(layer);
	} else {
		layer.setVisible(true);
	}
	return layer;
};

/**
 * Generates a URL for a WMS layer preview
 * @param {baseUrl} The base URL of the WMS
 * @param {layerName} The name of the layer
 * @param {wmsVersion} The version of the WMS
 * @returns The URL for the WMS layer preview
 */
export const generatePreviewUrl = (
	baseUrl: string,
	layerName: string,
	wmsVersion: string,
): string => {
	const url = new URL(baseUrl);
	url.searchParams.set("SERVICE", "WMS");
	url.searchParams.set("VERSION", wmsVersion);
	url.searchParams.set("REQUEST", "GetMap");
	url.searchParams.set("LAYERS", layerName);
	url.searchParams.set("STYLES", "");
	// default to EPSG:25833
	url.searchParams.set("CRS", "EPSG:25833");
	url.searchParams.set("BBOX", "388000,5818000,392000,5821000");
	url.searchParams.set("WIDTH", "600");
	url.searchParams.set("HEIGHT", "600");
	url.searchParams.set("FORMAT", "image/png");
	return url.toString();
};

/**
 * Builds a URL for a WMS layer's capabilities document.
 * @param {baseUrl} The base URL of the WMS
 * @param {wmsVersion} The version of the WMS
 * @returns The URL for the WMS layer's capabilities document
 */
export const buildCapabilitiesUrl = (
	baseUrl: string,
	wmsVersion: string,
): URL => {
	const url = new URL(baseUrl.trim());
	url.searchParams.delete("service");
	url.searchParams.delete("SERVICE");
	url.searchParams.delete("request");
	url.searchParams.delete("REQUEST");
	url.searchParams.delete("version");
	url.searchParams.delete("VERSION");

	url.searchParams.set("service", "WMS");
	url.searchParams.set("request", "GetCapabilities");
	url.searchParams.set("version", wmsVersion);
	return url;
};

/**
 * Creates a VectorLayer from a feature array.
 * @param {features} The Feature array to create the VectorLayer from
 * @param {fileName} The name of the file that is used to name the VectorLayer.
 * @param {layerId} The ID of the VectorLayer.
 * @param {style} The style of the VectorLayer.
 * @returns The created VectorLayer.
 */
export const createVectorLayer = (
	features: Feature[],
	fileName: string,
	layerId: string,
	style: Style,
) => {
	const vectorLayer = new VectorLayer({
		source: new VectorSource({ features }),
		style: style,
	});

	vectorLayer.set("name", getFileName(fileName));
	vectorLayer.set("id", layerId);

	return vectorLayer;
};

/**
 * Returns the base URL of a given URL string.
 * @param {urlString} The URL string to get the base URL from.
 * @returns The base URL of the given URL string.
 */
export const getBaseUrl = (urlString: string): string => {
	const url = new URL(urlString.trim());
	url.search = "";
	return url.toString();
};

/**
 * Returns the style configuration for a given style ID.
 * @param {styleId} The style ID to get the style configuration for.
 * @returns The style configuration for the given style ID, or null if no style configuration is found.
 */
export const getStyleConfig = (styleId: string): StyleConfig | null => {
	const styleConfig = styleList.find((s) => s.styleId === styleId);
	return styleConfig?.rules[0]?.style || null;
};

/**
 * Creates an OpenLayers style object from a given style configuration.
 * @param {styleConfig} The style configuration to create an OpenLayers style object from.
 * @returns The created OpenLayers style object.
 */
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

/**
 * Applies an OpenLayers style to a given layer.
 * @param {layer} The VectorLayer to apply the style to.
 * @param {styleId} The ID of the style configuration to apply.
 * @returns True if the style was applied successfully, otherwise false.
 */
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
