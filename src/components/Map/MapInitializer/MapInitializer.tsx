/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import mapConfig from "@/config/config.json";
import layerConfig from "@/config/layerConfig.json";
import services from "@/config/resources/services.json";
import { initializeProjections } from "@/lib/utils/ol/mapUtils";
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
	const setConfig = useMapStore((state) => state.setConfig);
	const setFlattenedLayerElements = useLayersStore(
		(state) => state.setFlattenedLayerElements,
	);
	const setLayerConfig = useLayersStore((state) => state.setLayerConfig);

	useEffect(() => {
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
				} else {
					return {
						...item,
						status: "initial" as LayerStatus,
						service: servicesMap.get(item.id),
						visibility: item.visibility !== undefined ? item.visibility : false,
					} as LayerElement;
				}
			});

		const rawMapConfig = structuredClone(mapConfig);

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

		setConfig(fullyEnrichedConfig);
		setLayerConfig(layerConfig as LayerConfigItem[]);
		setFlattenedLayerElements(allBaseAndSubjectLayers);
	}, [setConfig, setFlattenedLayerElements, setLayerConfig]);

	return null;
};

export default MapInitializer;
