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

function flattenLayerElements(
	elements: (LayerElement | LayerFolder)[],
): LayerElement[] {
	const result: LayerElement[] = [];

	elements.forEach((item) => {
		if (item.type === "folder") {
			result.push(
				...flattenLayerElements((item.elements as LayerElement[]) || []),
			);
		} else {
			result.push(item as LayerElement);
		}
	});

	return result;
}

const MapInitializer: FC = () => {
	const config = useMapStore((state) => state.config);
	const shouldInitialize = useMapStore((state) => state.shouldInitialize);
	const isConfigReady = useMapStore((state) => state.isConfigReady);

	const hasHydrated = useMapStore((state) => state.hasHydrated);
	const setConfig = useMapStore((state) => state.setConfig);
	const setInitialConfig = useMapStore((state) => state.setInitialConfig);
	const setIsConfigReady = useMapStore((state) => state.setIsConfigReady);
	const setFlattenedLayerElements = useLayersStore(
		(state) => state.setFlattenedLayerElements,
	);
	const setLayerConfig = useLayersStore((state) => state.setLayerConfig);
	const setShouldInitialize = useMapStore((state) => state.setShouldInitialize);

	// Check localStorage config on hydration
	useEffect(() => {
		console.log("[MapInitializer CHECK] hasHydrated:", hasHydrated);
		console.log("[MapInitializer CHECK] isConfigReady:", isConfigReady);

		if (!hasHydrated) return;
		if (isConfigReady) return;

		console.log("[MapInitializer CHECK] config from store:", config);

		const isValidConfig =
			config?.layerConfig?.baselayer?.elements &&
			config?.layerConfig?.subjectlayer?.elements;

		console.log("[MapInitializer CHECK] isValidConfig:", isValidConfig);

		if (!isValidConfig) {
			console.log("[MapInitializer CHECK] No valid config, will trigger INIT");
			// Don't set ready, let INIT handle it
		}
	}, [hasHydrated, config, isConfigReady]);

	useEffect(() => {
		console.log("[MapInitializer INIT] hasHydrated:", hasHydrated);
		console.log("[MapInitializer INIT] isConfigReady:", isConfigReady);
		console.log("[MapInitializer INIT] shouldInitialize:", shouldInitialize);

		if (!hasHydrated) {
			console.log("[MapInitializer INIT] Waiting for hydration...");
			return;
		}

		if (isConfigReady && !shouldInitialize) {
			console.log("[MapInitializer INIT] Already ready and no re-init needed");
			return;
		}

		console.log("[MapInitializer INIT] Starting initialization...");

		const servicesMap = new Map(
			services.map((service) => [service.id, service]),
		);

		const enrichAndTransformElements = (
			elements: any[],
		): (LayerElement | LayerFolder)[] =>
			elements.map((item) => {
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
					visibility: item.visibility !== undefined ? item.visibility : false,
				} as LayerElement;
			});

		const rawMapConfig = config
			? structuredClone(config)
			: structuredClone(mapConfig);

		console.log(
			"[MapInitializer INIT] Using config:",
			config ? "from store" : "default",
		);
		console.log("[MapInitializer INIT] rawMapConfig:", rawMapConfig);

		const enrichedBaseLayers = enrichAndTransformElements(
			rawMapConfig.layerConfig.baselayer.elements,
		) as LayerElement[];

		const enrichedSubjectLayers = enrichAndTransformElements(
			rawMapConfig.layerConfig.subjectlayer.elements,
		);

		const fullyEnrichedConfig: MapConfig = {
			...rawMapConfig,
			layerConfig: {
				baselayer: {
					elements: enrichedBaseLayers,
				},
				subjectlayer: {
					elements: enrichedSubjectLayers,
				},
			},
		};

		const allBaseAndSubjectLayers = [
			...enrichedBaseLayers,
			...flattenLayerElements(enrichedSubjectLayers),
		];

		console.log(
			"[MapInitializer INIT] fullyEnrichedConfig:",
			fullyEnrichedConfig,
		);
		console.log("[MapInitializer INIT] Setting stores...");

		setConfig(fullyEnrichedConfig);
		const currentInitialConfig = useMapStore.getState().initialConfig;
		if (!currentInitialConfig) setInitialConfig(fullyEnrichedConfig);
		setLayerConfig(layerConfig as LayerConfigItem[]);
		setFlattenedLayerElements(allBaseAndSubjectLayers);
		setIsConfigReady(true);
		setShouldInitialize(false);

		console.log("[MapInitializer INIT] Initialization complete");
	}, [
		hasHydrated,
		shouldInitialize,
		isConfigReady,
		config,
		setConfig,
		setInitialConfig,
		setIsConfigReady,
		setFlattenedLayerElements,
		setLayerConfig,
		setShouldInitialize,
	]);

	return null;
};

export default MapInitializer;
