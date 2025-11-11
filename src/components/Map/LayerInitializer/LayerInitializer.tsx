"use client";

import { applyStyleToLayer } from "@/lib/helpers/ol/layer";
import { getEpsgFromCrs } from "@/lib/helpers/ol/map";
import { useLayersStore } from "@/store/layers";
import { LayerService, ManagedLayer } from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { applyStyle } from "ol-mapbox-style";
import GeoJSON from "ol/format/GeoJSON";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
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
import { FC, useCallback, useEffect, useState } from "react";

interface WMTSCapabilitiesMap {
	[url: string]: object;
}

interface LayerCreationResult {
	layer: Layer | null;
	status: ManagedLayer["status"];
	error?: string;
}

const LayerInitializer: FC = () => {
	const config = useMapStore((state) => state.config);
	const map = useMapStore((state) => state.map);
	const setMapReady = useMapStore((state) => state.setMapReady);
	const setMapError = useMapStore((state) => state.setMapError);
	const setLayersInStore = useLayersStore((state) => state.setLayers);
	const flattenedLayerElements = useLayersStore(
		(state) => state.flattenedLayerElements,
	);

	const [wmtsCapabilities, setWmtsCapabilities] = useState<WMTSCapabilitiesMap>(
		{},
	);
	const [capabilitiesLoaded, setCapabilitiesLoaded] = useState(false);

	// Load WMTS capabilities with server-side caching
	useEffect(() => {
		if (!config || flattenedLayerElements.length === 0) return;

		const loadAllWmtsCapabilities = async () => {
			const wmtsServices = flattenedLayerElements.filter(
				(layer) =>
					layer.service?.typ === "WMTS" && layer.service?.capabilitiesUrl,
			);

			const uniqueCapabilitiesUrls = [
				...new Set(
					wmtsServices
						.map((layer) => layer.service?.capabilitiesUrl)
						.filter(Boolean),
				),
			] as string[];

			if (uniqueCapabilitiesUrls.length === 0) {
				setCapabilitiesLoaded(true);
				return;
			}

			try {
				const capabilitiesPromises = uniqueCapabilitiesUrls.map(async (url) => {
					const response = await fetch(
						`/api/wmts-capabilities?url=${encodeURIComponent(url)}`,
					);
					if (!response.ok) {
						throw new Error(
							`Failed to fetch WMTS capabilities from ${url}: ${response.status}`,
						);
					}

					const { xml } = await response.json();
					const parser = new WMTSCapabilities();
					return { url, capabilities: parser.read(xml) };
				});

				const results = await Promise.all(capabilitiesPromises);
				const capabilitiesMap = results.reduce((acc, { url, capabilities }) => {
					acc[url] = capabilities;
					return acc;
				}, {} as WMTSCapabilitiesMap);

				setWmtsCapabilities(capabilitiesMap);
			} catch (error) {
				console.error(
					"[LayerInitializer] Error loading WMTS capabilities:",
					error,
				);
			} finally {
				setCapabilitiesLoaded(true);
			}
		};

		loadAllWmtsCapabilities();
	}, [config, flattenedLayerElements]);

	const createWMTSLayer = useCallback(
		(serviceConfig: LayerService): LayerCreationResult => {
			const capabilities = wmtsCapabilities[serviceConfig.capabilitiesUrl!];
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

				return {
					layer: new TileLayer({ source: wmtsSource }),
					status: "loaded",
				};
			} catch (error) {
				return {
					layer: null,
					status: "error",
					error: error instanceof Error ? error.message : "Unknown WMTS error",
				};
			}
		},
		[wmtsCapabilities],
	);

	const createWMSLayer = useCallback(
		(serviceConfig: LayerService): LayerCreationResult => {
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
					return {
						layer: new ImageLayer({ source: imageSource }),
						status: "loaded",
					};
				}

				const tileSource = new TileWMS({
					url: serviceConfig.url,
					params,
					serverType: "geoserver",
					attributions: serviceConfig.layerAttribution,
				});

				return {
					layer: new TileLayer({ source: tileSource }),
					status: "loaded",
				};
			} catch (error) {
				return {
					layer: null,
					status: "error",
					error: error instanceof Error ? error.message : "Unknown WMS error",
				};
			}
		},
		[],
	);

	// Enhanced WFS layer with caching
	const createWFSLayer = useCallback(
		(serviceConfig: LayerService): LayerCreationResult => {
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

				// Ensure config is not null before accessing portalConfig
				const featureProjection = config
					? config.portalConfig.map.mapView.epsg
					: "EPSG:25833"; // Provide a default if config is null

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

				// Apply style if specified in serviceConfig
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
		},
		[config],
	);

	const createVectorTileLayer = useCallback(
		(serviceConfig: LayerService): LayerCreationResult => {
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
		},
		[],
	);

	const createGeoJSONLayer = useCallback(
		(serviceConfig: LayerService): LayerCreationResult => {
			try {
				const dataProjection = serviceConfig.crs
					? getEpsgFromCrs(serviceConfig.crs)
					: "EPSG:25833";

				const featureProjection =
					config?.portalConfig.map.mapView.epsg || "EPSG:25833";

				const vectorSource = new VectorSource({
					format: new GeoJSON({
						dataProjection: dataProjection,
						featureProjection: featureProjection,
					}),
				});

				const vectorLayer = new VectorLayer({
					source: vectorSource,
				});

				// Apply style if specified in serviceConfig
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
					error:
						error instanceof Error ? error.message : "Unknown GeoJSON error",
				};
			}
		},
		[config],
	);

	// Create a single layer based on service configuration
	const createLayer = useCallback(
		(serviceConfig: LayerService): LayerCreationResult => {
			switch (serviceConfig.typ) {
				case "WMTS":
					return createWMTSLayer(serviceConfig);
				case "WMS":
					return createWMSLayer(serviceConfig);
				case "WFS":
					return createWFSLayer(serviceConfig);
				case "VectorTile":
					return createVectorTileLayer(serviceConfig);
				case "GEOJSON":
					return createGeoJSONLayer(serviceConfig);
				default:
					return {
						layer: null,
						status: "error",
						error: `Unknown layer type: ${serviceConfig.typ}`,
					};
			}
		},
		[
			createWMTSLayer,
			createWMSLayer,
			createWFSLayer,
			createVectorTileLayer,
			createGeoJSONLayer,
		],
	);

	// Main effect to initialize all layers
	useEffect(() => {
		if (
			!config ||
			!map ||
			!capabilitiesLoaded ||
			flattenedLayerElements.length === 0
		) {
			return;
		}

		const newManagedLayersMap = new Map<string, ManagedLayer>();

		flattenedLayerElements.forEach((layerConfig, index) => {
			const { service: serviceConfig } = layerConfig;

			if (!serviceConfig) {
				console.warn(
					`[LayerInitializer] Layer ${layerConfig.id} has no service config. Skipping.`,
				);
				return;
			}

			const { layer: olLayer, status, error } = createLayer(serviceConfig);

			if (olLayer) {
				const isBaseLayer = config.layerConfig.baselayer.elements.some(
					(baseEl) => baseEl.id === layerConfig.id,
				);
				const layerType: "base" | "subject" = isBaseLayer ? "base" : "subject";

				const zIndex = (layerType === "base" ? 0 : 100) + index; // Keep zIndex logic
				olLayer.setZIndex(zIndex);
				olLayer.setVisible(layerConfig.visibility);
				olLayer.setOpacity(1);
				olLayer.set("id", layerConfig.id);

				const managedLayer: ManagedLayer = {
					id: layerConfig.id,
					config: layerConfig,
					olLayer: olLayer,
					status: status,
					visibility: layerConfig.visibility,
					opacity: 1,
					zIndex: zIndex,
					layerType: layerType,
					error: error,
				};

				newManagedLayersMap.set(layerConfig.id, managedLayer);
				map.addLayer(olLayer);
			} else {
				console.error(
					`[LayerInitializer] Failed to create layer ${layerConfig.id}:`,
					error,
				);
				newManagedLayersMap.set(layerConfig.id, {
					id: layerConfig.id,
					config: layerConfig,
					olLayer: null,
					status: "error",
					visibility: layerConfig.visibility,
					opacity: 1,
					zIndex: 0,
					layerType: "subject",
					error: error || "Layer creation failed",
				});
			}
		});

		setLayersInStore(newManagedLayersMap);

		const baseLayers = Array.from(newManagedLayersMap.values()).filter(
			(layer) => layer.layerType === "base",
		);
		const hasAnyLoadedBaseLayers = baseLayers.some(
			(layer) => layer.status === "loaded",
		);
		const hasBasemapErrors = baseLayers.some(
			(layer) => layer.status === "error",
		);

		if (baseLayers.length > 0 && !hasAnyLoadedBaseLayers && hasBasemapErrors) {
			const firstError = baseLayers.find((layer) => layer.error)?.error;
			setMapError(
				true,
				firstError || "Hintergrundkarte konnte nicht geladen werden",
			);
			setMapReady(false);
		} else if (hasAnyLoadedBaseLayers) {
			setMapError(false);
			setMapReady(true);
		}

		return () => {
			newManagedLayersMap.forEach((managedLayer) => {
				if (managedLayer.olLayer) {
					map.removeLayer(managedLayer.olLayer);
				}
			});
			setLayersInStore(new Map());
			setMapReady(false);
		};
	}, [
		config,
		map,
		capabilitiesLoaded,
		flattenedLayerElements,
		createLayer,
		setLayersInStore,
		setMapReady,
		setMapError,
	]);

	return null;
};

export default LayerInitializer;
