import OLMap from "ol/Map";
import ImageWMS from "ol/source/ImageWMS";
import TileWMS from "ol/source/TileWMS";

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

const getBaseUrl = (source: any): string | null => {
	if (source instanceof TileWMS) {
		const urls = source.getUrls();
		return urls?.[0] ?? null;
	}
	if (source instanceof ImageWMS) {
		return source.getUrl() ?? null;
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
	const baseUrl = source && getBaseUrl(source);
	if (!baseUrl) return null;

	const view = map.getView();
	const mapSize = map.getSize();
	const pixel = map.getPixelFromCoordinate(coordinate);
	const resolution = view.getResolution();
	const projection = view.getProjection();

	if (!mapSize || !pixel || !resolution || !projection) return null;

	const url = new URL(baseUrl);
	const extent = view.calculateExtent(mapSize);
	const params = buildWmsParams(
		layerId,
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
