"use client";

import { createLayerByType } from "@/components/Map/LayerInitializer/shared/layerFactory";
import { getDrawLayerIds } from "@/lib/helpers/ol";
import { useLayersStore } from "@/store/layers";
import { ManagedLayer } from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { FC, useEffect } from "react";
import { useWmtsCapabilities } from "./hooks/useWmtsCapabilities";

const Z_INDEX = {
	BASE: 0,
	SUBJECT: 100,
	DRAW: 1000,
} as const;

function calculateZIndex(
	isBaseLayer: boolean,
	isDrawLayer: boolean,
	index: number,
): number {
	if (isBaseLayer) return Z_INDEX.BASE + index;
	if (isDrawLayer) return Z_INDEX.DRAW + index;
	return Z_INDEX.SUBJECT + index;
}

const LayerInitializer: FC = () => {
	const initialConfig = useMapStore((state) => state.initialConfig);
	const map = useMapStore((state) => state.map);
	const resetId = useMapStore((state) => state.resetId);
	const flattenedLayerElements = useLayersStore(
		(state) => state.flattenedLayerElements,
	);

	const { wmtsCapabilities, capabilitiesLoaded } = useWmtsCapabilities(
		initialConfig,
		flattenedLayerElements,
	);

	useEffect(() => {
		if (
			!map ||
			!initialConfig ||
			!capabilitiesLoaded ||
			flattenedLayerElements.length === 0
		) {
			return;
		}

		const newManagedLayersMap = new Map<string, ManagedLayer>();
		const drawLayerIds = getDrawLayerIds(initialConfig);
		const baseLayerIds = new Set(
			initialConfig.layerConfig.baselayer.elements.map((el) => el.id),
		);

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

			if (!olLayer) {
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
				return;
			}

			const isBaseLayer = baseLayerIds.has(layerConfig.id);
			const isDrawLayer = drawLayerIds.includes(layerConfig.id);
			const zIndex = calculateZIndex(isBaseLayer, isDrawLayer, index);

			olLayer.setZIndex(zIndex);
			olLayer.setVisible(layerConfig.visibility);
			olLayer.setOpacity(1);
			olLayer.set("id", layerConfig.id);

			const managedLayer: ManagedLayer = {
				id: layerConfig.id,
				config: layerConfig,
				olLayer,
				status,
				visibility: layerConfig.visibility,
				opacity: 1,
				zIndex,
				layerType: isBaseLayer ? "base" : "subject",
				error,
			};

			newManagedLayersMap.set(layerConfig.id, managedLayer);
			map.addLayer(olLayer);
		});

		useLayersStore.getState().setLayers(newManagedLayersMap);

		const baseLayers = Array.from(newManagedLayersMap.values()).filter(
			(layer) => layer.layerType === "base",
		);

		if (baseLayers.length > 0) {
			const hasLoadedBase = baseLayers.some(
				(layer) => layer.status === "loaded",
			);
			const hasErrorBase = baseLayers.some((layer) => layer.status === "error");

			if (!hasLoadedBase && hasErrorBase) {
				const firstError = baseLayers.find((layer) => layer.error)?.error;
				useMapStore
					.getState()
					.setMapError(
						true,
						firstError || "Hintergrundkarte konnte nicht geladen werden",
					);
				useMapStore.getState().setMapReady(false);
			} else if (hasLoadedBase) {
				useMapStore.getState().setMapError(false);
				useMapStore.getState().setMapReady(true);
			}
		}
	}, [
		map,
		initialConfig,
		capabilitiesLoaded,
		flattenedLayerElements,
		wmtsCapabilities,
		resetId,
	]);

	return null;
};

export default LayerInitializer;
