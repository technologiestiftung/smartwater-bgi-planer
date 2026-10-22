import OLMap from "ol/Map";
import ImageWMS from "ol/source/ImageWMS";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";

const GWC_WMTS_PATH = "/gwc/service/wmts";

export interface FeatureInfoOptions {
	coordinate: [number, number];
	layerId: string;
	map: OLMap;
}

export interface FeatureInfoResult {
	attributes: Record<string, any> | null;
	layerId: string;
	error?: string;
}

const getWmsTarget = (
	source: any,
): { baseUrl: string; layers: string } | null => {
	if (source instanceof TileWMS) {
		const baseUrl = source.getUrls()?.[0];
		return baseUrl ? { baseUrl, layers: source.getParams().LAYERS } : null;
	}
	if (source instanceof ImageWMS) {
		const baseUrl = source.getUrl();
		return baseUrl ? { baseUrl, layers: source.getParams().LAYERS } : null;
	}
	// GeoServer serves the WMTS cache and the WMS from the same workspace
	if (source instanceof WMTS) {
		const wmtsUrl = source.getUrls()?.[0];
		if (!wmtsUrl?.includes(GWC_WMTS_PATH)) return null;
		return {
			baseUrl: wmtsUrl.replace(GWC_WMTS_PATH, "/wms"),
			layers: source.getLayer(),
		};
	}
	return null;
};

const buildWmsParams = (
	layerId: string,
	extent: number[],
	pixel: number[],
	mapSize: number[],
	projection: string,
) => ({
	SERVICE: "WMS",
	VERSION: "1.3.0",
	REQUEST: "GetFeatureInfo",
	FORMAT: "image/png",
	TRANSPARENT: "true",
	QUERY_LAYERS: layerId,
	LAYERS: layerId,
	INFO_FORMAT: "application/json",
	FEATURE_COUNT: "10",
	WIDTH: mapSize[0].toString(),
	HEIGHT: mapSize[1].toString(),
	CRS: projection,
	STYLES: "",
	BBOX: extent.join(","),
	I: Math.round(pixel[0]).toString(),
	J: Math.round(pixel[1]).toString(),
});

export const buildGetFeatureInfoUrl = (
	coordinate: [number, number],
	layerId: string,
	map: OLMap,
): string | null => {
	const layer = map.getAllLayers().find((l) => l.get("id") === layerId);
	const source = layer?.getSource();
	const target = source && getWmsTarget(source);
	if (!target) return null;

	const view = map.getView();
	const mapSize = map.getSize();
	const pixel = map.getPixelFromCoordinate(coordinate);
	const resolution = view.getResolution();
	const projection = view.getProjection();

	if (!mapSize || !pixel || !resolution || !projection) return null;

	const url = new URL(target.baseUrl);
	const extent = view.calculateExtent(mapSize);
	const params = buildWmsParams(
		target.layers ?? layerId,
		extent,
		pixel,
		mapSize,
		projection.getCode(),
	);

	Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
	return url.toString();
};

const parseFeatureInfoResponse = (
	data: any,
	layerId: string,
): FeatureInfoResult => {
	const feature = data.features?.[0] || data.results?.[0];

	if (feature) {
		return {
			attributes: feature.properties || feature.attributes || {},
			layerId,
		};
	}

	return {
		attributes: null,
		layerId,
		error: "No features found at this location",
	};
};

export const fetchFeatureInfo = async (
	options: FeatureInfoOptions,
): Promise<FeatureInfoResult> => {
	const { coordinate, layerId, map } = options;

	try {
		const url = buildGetFeatureInfoUrl(coordinate, layerId, map);
		if (!url) {
			return {
				attributes: null,
				layerId,
				error: "Could not build GetFeatureInfo URL",
			};
		}

		const response = await fetch(url);
		if (!response.ok) {
			return {
				attributes: null,
				layerId,
				error: `HTTP ${response.status}: ${response.statusText}`,
			};
		}

		return parseFeatureInfoResponse(await response.json(), layerId);
	} catch (error) {
		return {
			attributes: null,
			layerId,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};
