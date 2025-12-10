"use client";

import { createLayerByType } from "@/components/Map/LayerInitializer/shared/layerFactory";
import { getDrawLayerIds } from "@/lib/helpers/ol";
import { useLayersStore } from "@/store/layers";
import { ManagedLayer } from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { FC, useEffect } from "react";
import { useWmtsCapabilities } from "./hooks/useWmtsCapabilities";

const LayerInitializer: FC = () => {
	const initialConfig = useMapStore((state) => state.initialConfig);

	const map = useMapStore((state) => state.map);

	const setMapReady = useMapStore((state) => state.setMapReady);
	const setMapError = useMapStore((state) => state.setMapError);
	const setLayersInStore = useLayersStore((state) => state.setLayers);
	const flattenedLayerElements = useLayersStore(
		(state) => state.flattenedLayerElements,
	);

	const { wmtsCapabilities, capabilitiesLoaded } = useWmtsCapabilities(
		initialConfig,
		flattenedLayerElements,
	);

	useEffect(() => {
		if (
			!initialConfig ||
			!map ||
			!capabilitiesLoaded ||
			flattenedLayerElements.length === 0
		) {
			return;
		}

		const newManagedLayersMap = new Map<string, ManagedLayer>();
		const drawLayerIdsForInit = getDrawLayerIds(initialConfig);

		flattenedLayerElements.forEach((layerConfig, index) => {
			const { service: serviceConfig } = layerConfig;

			if (!serviceConfig) {
				console.warn(
					`[LayerInitializer] Layer ${layerConfig.id} has no service config. Skipping.`,
				);
				return;
			}

			const {
				layer: olLayer,
				status,
				error,
			} = createLayerByType(serviceConfig, {
				wmtsCapabilities,
				config: initialConfig,
			});

			if (olLayer) {
				const isBaseLayer = initialConfig.layerConfig.baselayer.elements.some(
					(baseEl) => baseEl.id === layerConfig.id,
				);
				const layerType: "base" | "subject" = isBaseLayer ? "base" : "subject";

				const isDrawLayer = drawLayerIdsForInit.includes(layerConfig.id);

				// Explicit zIndex values to ensure proper layer ordering:
				let zIndex: number;
				if (isBaseLayer) {
					zIndex = index;
				} else if (isDrawLayer) {
					zIndex = 1000 + index;
				} else {
					zIndex = 100 + index;
				}

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
		initialConfig,
		map,
		capabilitiesLoaded,
		flattenedLayerElements,
		wmtsCapabilities,
		setLayersInStore,
		setMapReady,
		setMapError,
	]);

	return null;
};

export default LayerInitializer;
