"use client";

import mapConfig from "@/config/config.json";
import layerConfig from "@/config/layerConfig.json";
import services from "@/config/resources/services.json";
import { initializeProjections } from "@/lib/helpers/ol";
import { useLayersStore } from "@/store/layers";
import {
	LayerConfigItem,
	LayerElement,
	LayerFolder,
} from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { MapConfig } from "@/store/map/types";
import { LayerStatus } from "@/types/shared";
import { FC, useEffect } from "react";

initializeProjections();

const servicesMap = new Map(services.map((service) => [service.id, service]));

function flattenLayerElements(
	elements: (LayerElement | LayerFolder)[],
): LayerElement[] {
	return elements.flatMap((item) =>
		item.type === "folder"
			? flattenLayerElements((item.elements as LayerElement[]) || [])
			: [item as LayerElement],
	);
}

function enrichAndTransformElements(
	elements: any[],
): (LayerElement | LayerFolder)[] {
	return elements.map((item) => {
		if (item.type === "folder") {
			return {
				...item,
				type: "folder",
				elements: enrichAndTransformElements(item.elements || []),
			} as LayerFolder;
		}
		return {
			...item,
			status: "initial" as LayerStatus,
			service: servicesMap.get(item.id),
			visibility: item.visibility ?? false,
		} as LayerElement;
	});
}

function createEnrichedConfig(rawConfig: MapConfig): MapConfig {
	const enrichedBaseLayers = enrichAndTransformElements(
		rawConfig.layerConfig.baselayer.elements,
	) as LayerElement[];

	const enrichedSubjectLayers = enrichAndTransformElements(
		rawConfig.layerConfig.subjectlayer.elements,
	);

	return {
		...rawConfig,
		layerConfig: {
			baselayer: { elements: enrichedBaseLayers },
			subjectlayer: { elements: enrichedSubjectLayers },
		},
	};
}

const MapInitializer: FC = () => {
	const hasHydrated = useMapStore((state) => state.hasHydrated);
	const config = useMapStore((state) => state.config);
	const resetId = useMapStore((state) => state.resetId);
	const isInitializeReady = useMapStore((state) => state.isInitializeReady);

	const setConfig = useMapStore((state) => state.setConfig);
	const setIsInitializeReady = useMapStore(
		(state) => state.setIsInitializeReady,
	);
	const setFlattenedLayerElements = useLayersStore(
		(state) => state.setFlattenedLayerElements,
	);
	const setLayerConfig = useLayersStore((state) => state.setLayerConfig);

	useEffect(() => {
		if (!hasHydrated || isInitializeReady) return;

		const rawMapConfig = structuredClone(mapConfig as any);
		const fullyEnrichedConfig = createEnrichedConfig(rawMapConfig);

		const allLayers = [
			...fullyEnrichedConfig.layerConfig.baselayer.elements,
			...flattenLayerElements(
				fullyEnrichedConfig.layerConfig.subjectlayer.elements,
			),
		];

		setConfig(fullyEnrichedConfig);
		setLayerConfig(layerConfig as LayerConfigItem[]);
		setFlattenedLayerElements(allLayers);
		setIsInitializeReady(true);
	}, [
		hasHydrated,
		config,
		resetId,
		isInitializeReady,
		setConfig,
		setIsInitializeReady,
		setFlattenedLayerElements,
		setLayerConfig,
	]);

	return null;
};

export default MapInitializer;
