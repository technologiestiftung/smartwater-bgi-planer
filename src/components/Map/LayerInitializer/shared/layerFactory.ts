import {
	applyStyleToLayer,
	getEpsgFromCrs,
	scaleToResolution,
} from "@/lib/helpers/ol";
import { LayerService, ManagedLayer } from "@/store/layers/types";
import { applyStyle } from "ol-mapbox-style";
import GeoJSON from "ol/format/GeoJSON";
import { Layer } from "ol/layer";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import ImageWMS from "ol/source/ImageWMS";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";

interface WMTSCapabilitiesMap {
	[url: string]: object;
}

interface LayerCreationResult {
	layer: Layer | null;
	status: ManagedLayer["status"];
	error?: string;
}

interface LayerCreationHelpers {
	wmtsCapabilities: WMTSCapabilitiesMap;
	config: any;
}

const createWMTSLayer = (
	serviceConfig: LayerService,
	helpers: LayerCreationHelpers,
): LayerCreationResult => {
	const capabilities = helpers.wmtsCapabilities[serviceConfig.capabilitiesUrl!];
	if (!capabilities) {
		return {
			layer: null,
			status: "error",
			error: `WMTS capabilities for ${serviceConfig.capabilitiesUrl} not loaded`,
		};
	}

	try {
		const options = optionsFromCapabilities(capabilities, {
			layer: serviceConfig.layers!,
			matrixSet: serviceConfig.tileMatrixSet!,
		});

		if (!options) {
			return {
				layer: null,
				status: "error",
				error: "Failed to create WMTS options from capabilities",
			};
		}

		const wmtsSource = new WMTS({
			...options,
			attributions: serviceConfig.layerAttribution,
		});
		const tileLayer = new TileLayer({ source: wmtsSource });

		if (serviceConfig.minScale) {
			const minRes = scaleToResolution(serviceConfig.minScale, helpers.config);
			if (minRes !== undefined) tileLayer.setMinResolution(minRes);
		}
		if (serviceConfig.maxScale) {
			const maxRes = scaleToResolution(serviceConfig.maxScale, helpers.config);
			if (maxRes !== undefined) tileLayer.setMaxResolution(maxRes);
		}

		return {
			layer: tileLayer,
			status: "loaded",
		};
	} catch (error) {
		return {
			layer: null,
			status: "error",
			error: error instanceof Error ? error.message : "Unknown WMTS error",
		};
	}
};

const createWMSLayer = (
	serviceConfig: LayerService,
	helpers?: LayerCreationHelpers,
): LayerCreationResult => {
	try {
		if (!serviceConfig.url) {
			return {
				layer: null,
				status: "error",
				error: "WMS layer requires a URL",
			};
		}

		const params = {
			LAYERS: serviceConfig.layers,
			FORMAT: serviceConfig.format || "image/png",
			TRANSPARENT: serviceConfig.transparent ?? true,
			VERSION: serviceConfig.version || "1.3.0",
		};

		if (serviceConfig.singleTile) {
			const imageSource = new ImageWMS({
				url: serviceConfig.url,
				params,
				serverType: "geoserver",
				attributions: serviceConfig.layerAttribution,
			});
			const imageLayer = new ImageLayer({ source: imageSource });

			if (serviceConfig.minScale && helpers) {
				const minRes = scaleToResolution(
					serviceConfig.minScale,
					helpers.config,
				);
				if (minRes !== undefined) imageLayer.setMinResolution(minRes);
			}
			if (serviceConfig.maxScale && helpers) {
				const maxRes = scaleToResolution(
					serviceConfig.maxScale,
					helpers.config,
				);
				if (maxRes !== undefined) imageLayer.setMaxResolution(maxRes);
			}
			return {
				layer: imageLayer,
				status: "loaded",
			};
		}

		const tileSource = new TileWMS({
			url: serviceConfig.url,
			params,
			serverType: "geoserver",
			attributions: serviceConfig.layerAttribution,
		});
		const tileLayer = new TileLayer({ source: tileSource });
		if (serviceConfig.minScale && helpers) {
			const minRes = scaleToResolution(serviceConfig.minScale, helpers.config);
			if (minRes !== undefined) tileLayer.setMinResolution(minRes);
		}
		if (serviceConfig.maxScale && helpers) {
			const maxRes = scaleToResolution(serviceConfig.maxScale, helpers.config);
			if (maxRes !== undefined) tileLayer.setMaxResolution(maxRes);
		}
		return {
			layer: tileLayer,
			status: "loaded",
		};
	} catch (error) {
		return {
			layer: null,
			status: "error",
			error: error instanceof Error ? error.message : "Unknown WMS error",
		};
	}
};

const createWFSLayer = (
	serviceConfig: LayerService,
	helpers: LayerCreationHelpers,
): LayerCreationResult => {
	try {
		if (!serviceConfig.url) {
			return {
				layer: null,
				status: "error",
				error: "WFS layer requires a URL",
			};
		}

		const dataProjection = serviceConfig.crs
			? getEpsgFromCrs(serviceConfig.crs)
			: "EPSG:25833";

		const featureProjection = helpers.config
			? helpers.config.portalConfig.map.mapView.epsg
			: "EPSG:25833";

		const vectorSource = new VectorSource({
			format: new GeoJSON({
				dataProjection: dataProjection,
				featureProjection: featureProjection,
			}),
			url: (extent) => {
				const bbox = extent.join(",");
				return `/api/wfs-cache?service=${encodeURIComponent(
					serviceConfig.url!,
				)}&typename=${
					serviceConfig.featureType
				}&bbox=${bbox}&dataProjection=${encodeURIComponent(
					dataProjection,
				)}&featureProjection=${encodeURIComponent(featureProjection)}`;
			},
			strategy: bboxStrategy,
		});

		const vectorLayer = new VectorLayer({ source: vectorSource });

		if (serviceConfig.styleId) {
			applyStyleToLayer(vectorLayer, serviceConfig.styleId);
		}

		return {
			layer: vectorLayer,
			status: "loaded",
		};
	} catch (error) {
		return {
			layer: null,
			status: "error",
			error: error instanceof Error ? error.message : "Unknown WFS error",
		};
	}
};

const createVectorTileLayer = (
	serviceConfig: LayerService,
): LayerCreationResult => {
	try {
		if (!serviceConfig.vtStyles || serviceConfig.vtStyles.length === 0) {
			return {
				layer: null,
				status: "error",
				error: "No vector tile styles configured",
			};
		}

		const layer = new VectorTileLayer({ declutter: true });

		if (serviceConfig.vtStyles.length > 0) {
			serviceConfig.vtStyles.forEach((style) => {
				applyStyle(layer, style.url);
			});
		}

		return {
			layer,
			status: "loaded",
		};
	} catch (error) {
		return {
			layer: null,
			status: "error",
			error:
				error instanceof Error ? error.message : "Unknown VectorTile error",
		};
	}
};

const createGeoJSONLayer = (
	serviceConfig: LayerService,
	helpers: LayerCreationHelpers,
): LayerCreationResult => {
	try {
		const dataProjection = serviceConfig.crs
			? getEpsgFromCrs(serviceConfig.crs)
			: "EPSG:25833";

		const featureProjection =
			helpers.config?.portalConfig.map.mapView.epsg || "EPSG:25833";

		const vectorSource = new VectorSource({
			format: new GeoJSON({
				dataProjection: dataProjection,
				featureProjection: featureProjection,
			}),
		});

		const vectorLayer = new VectorLayer({
			source: vectorSource,
		});

		if (serviceConfig.styleId) {
			const styleApplied = applyStyleToLayer(
				vectorLayer,
				serviceConfig.styleId,
			);
			if (!styleApplied) {
				console.warn(
					`Failed to apply style "${serviceConfig.styleId}" to layer`,
				);
			}
		}

		return {
			layer: vectorLayer,
			status: "loaded",
		};
	} catch (error) {
		return {
			layer: null,
			status: "error",
			error: error instanceof Error ? error.message : "Unknown GeoJSON error",
		};
	}
};

export const createLayerByType = (
	serviceConfig: LayerService,
	helpers: LayerCreationHelpers,
): LayerCreationResult => {
	switch (serviceConfig.typ) {
		case "WMTS":
			return createWMTSLayer(serviceConfig, helpers);
		case "WMS":
			return createWMSLayer(serviceConfig, helpers);
		case "WFS":
			return createWFSLayer(serviceConfig, helpers);
		case "VectorTile":
			return createVectorTileLayer(serviceConfig);
		case "GEOJSON":
			return createGeoJSONLayer(serviceConfig, helpers);
		default:
			return {
				layer: null,
				status: "error",
				error: `Unknown layer type: ${serviceConfig.typ}`,
			};
	}
};
