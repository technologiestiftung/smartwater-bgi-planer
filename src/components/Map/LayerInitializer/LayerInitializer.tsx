"use client";

import {
	categorizeLayerErrors,
	getErrorMessage,
} from "@/components/Map/LayerInitializer/shared/errorHandling";
import { createLayerByType } from "@/components/Map/LayerInitializer/shared/layerFactory";
import { useLayersStore } from "@/store/layers";
import { LayerService, ManagedLayer } from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { FC, useCallback, useEffect } from "react";
import { useWmtsCapabilities } from "./hooks/useWmtsCapabilities";

const LayerInitializer: FC = () => {
	const config = useMapStore((state) => state.config);
	const map = useMapStore((state) => state.map);
	const setMapReady = useMapStore((state) => state.setMapReady);
	const setMapError = useMapStore((state) => state.setMapError);
	const setLayersInStore = useLayersStore((state) => state.setLayers);
	const flattenedLayerElements = useLayersStore(
		(state) => state.flattenedLayerElements,
	);

	const { capabilities: wmtsCapabilities, loaded: capabilitiesLoaded } =
		useWmtsCapabilities(flattenedLayerElements, config);

	const createLayer = useCallback(
		(serviceConfig: LayerService) => {
			return createLayerByType(serviceConfig, {
				wmtsCapabilities,
				config,
			});
		},
		[wmtsCapabilities, config],
	);

	const initializeLayers = useCallback(() => {
		if (
			!config ||
			!map ||
			!capabilitiesLoaded ||
			flattenedLayerElements.length === 0
		) {
			return null;
		}

		const newManagedLayersMap = new Map();

		flattenedLayerElements.forEach((layerConfig, index) => {
			if (!layerConfig.service) {
				console.warn(
					`[LayerInitializer] Layer ${layerConfig.id} has no service config. Skipping.`,
				);
				return;
			}

			const {
				layer: olLayer,
				status,
				error,
			} = createLayer(layerConfig.service);

			const isBaseLayer = config?.layerConfig?.baselayer?.elements?.some(
				(baseLayerElement: any) => baseLayerElement.id === layerConfig.id,
			);

			const zIndex = index;

			const managedLayer: ManagedLayer = {
				id: layerConfig.id,
				config: layerConfig,
				olLayer,
				status,
				visibility: layerConfig.visibility ?? false,
				opacity: 1,
				zIndex: zIndex,
				layerType: isBaseLayer ? "base" : "subject",
				error,
			};

			newManagedLayersMap.set(layerConfig.id, managedLayer);

			if (olLayer) {
				// Set all the OpenLayers layer properties
				olLayer.setZIndex(managedLayer.zIndex);
				olLayer.setVisible(managedLayer.visibility);
				olLayer.setOpacity(managedLayer.opacity);
				olLayer.set("id", layerConfig.id);
				map.addLayer(olLayer);
			}
		});

		return newManagedLayersMap;
	}, [config, map, capabilitiesLoaded, flattenedLayerElements, createLayer]);

	const handleMapStatus = useCallback(
		(managedLayers: Map<string, ManagedLayer>) => {
			const criticalLayerIds: string[] = ["rabimo_input_2025"];
			const errors = categorizeLayerErrors(managedLayers, criticalLayerIds);

			const baseLayers = Array.from(managedLayers.values()).filter(
				(layer) => layer.layerType === "base",
			);
			const hasAnyLoadedBaseLayers = baseLayers.some(
				(layer) => layer.status === "loaded",
			);

			if (
				(baseLayers.length > 0 &&
					!hasAnyLoadedBaseLayers &&
					errors.hasBaseLayerError) ||
				errors.critical.length > 0
			) {
				const errorMessage = getErrorMessage(
					errors,
					baseLayers,
					hasAnyLoadedBaseLayers,
				);
				setMapError(true, errorMessage);
				setMapReady(false);
			} else if (hasAnyLoadedBaseLayers) {
				setMapError(false);
				setMapReady(true);

				if (errors.nonCritical.length > 0) {
					console.warn(
						`[LayerInitializer] Some non-critical layers failed to load: ${errors.nonCritical.join(", ")}`,
					);
				}
			}
		},
		[setMapError, setMapReady],
	);

	useEffect(() => {
		const managedLayers = initializeLayers();

		if (managedLayers) {
			setLayersInStore(managedLayers);
			handleMapStatus(managedLayers);
		}

		return () => {
			if (managedLayers) {
				managedLayers.forEach((managedLayer) => {
					if (managedLayer.olLayer) {
						map?.removeLayer(managedLayer.olLayer);
					}
				});
			}
			setLayersInStore(new Map());
			setMapReady(false);
		};
	}, [initializeLayers, setLayersInStore, handleMapStatus, map, setMapReady]);

	return null;
};

export default LayerInitializer;
