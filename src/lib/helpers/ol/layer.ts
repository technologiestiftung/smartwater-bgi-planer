import { getFileName } from "@/lib/helpers/file";
import {
	LayerElementBase,
	LayerFolder,
	ManagedLayer,
} from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import type Map from "ol/Map";
import { Vector as VectorSource } from "ol/source";
import { Style } from "ol/style";

export type LayerTreeElement = LayerElementBase | LayerFolder;

export const getVectorLayer = (map: Map, layerId: string) => {
	return getLayerById(map, layerId) as VectorLayer<VectorSource> | null;
};

export const getLayerSource = (layer: VectorLayer<VectorSource> | null) => {
	return layer?.getSource() ?? null;
};

export const layerHasFeatures = (map: Map, layerId: string): boolean => {
	const source = getLayerSource(getVectorLayer(map, layerId));
	return source ? source.getFeatures().length > 0 : false;
};

export const ensureVectorLayer = (
	map: Map,
	layerId: string,
): VectorLayer<VectorSource> => {
	let layer = getLayerById(map, layerId) as
		| VectorLayer<VectorSource>
		| undefined;

	if (!layer) {
		const source = new VectorSource();
		layer = new VectorLayer({ source });
		layer.set("id", layerId);
		map.addLayer(layer);
	} else {
		layer.setVisible(true);
	}
	return layer;
};

export function getLayerIdsInFolder(
	folderElements: LayerTreeElement[],
	folderName: string,
	foundIds: Set<string> = new Set(),
): Set<string> {
	folderElements.forEach((item) => {
		if (item.type === "folder") {
			if (item.name === folderName) {
				const flattenFolderChildren = (children: LayerTreeElement[]) => {
					children.forEach((child) => {
						if (child.type === "folder") {
							flattenFolderChildren(child.elements);
						} else if ("id" in child) {
							foundIds.add(child.id);
						}
					});
				};
				flattenFolderChildren(item.elements);
			} else {
				getLayerIdsInFolder(item.elements ?? [], folderName, foundIds);
			}
		}
	});
	return foundIds;
}

export const getLayerById = (map: Map | null, id: string) => {
	if (!map) return null;
	return map.getAllLayers().find((l) => l.get("id") === id) as
		| VectorLayer<VectorSource>
		| undefined;
};

export const createVectorLayer = (
	features: Feature[],
	fileName: string,
	layerId: string,
	style: Style,
) => {
	const vectorLayer = new VectorLayer({
		source: new VectorSource({ features }),
		style: style,
	});

	vectorLayer.set("name", getFileName(fileName));
	vectorLayer.set("id", layerId);

	return vectorLayer;
};

export const getLayerIdsFromFolder = (folderName: string): string[] => {
	try {
		const { config } = useMapStore.getState();
		const elements = config?.layerConfig?.subjectlayer?.elements;

		if (elements) {
			return Array.from(getLayerIdsInFolder(elements, folderName));
		}
	} catch (error) {
		console.error("[getAllDrawLayerIds] Error getting draw layer IDs:", error);
	}
	return [];
};

export const isDrawLayer = (layerId: string): boolean => {
	return getLayerIdsFromFolder("Draw Layers").includes(layerId);
};

export const createManagedLayer = (
	layerId: string,
	fileName: string,
	olLayer: VectorLayer<VectorSource>,
): ManagedLayer => ({
	id: layerId,
	config: {
		id: layerId,
		name: getFileName(fileName),
		visibility: true,
		status: "loaded",
		elements: [],
	},
	olLayer,
	status: "loaded",
	visibility: true,
	opacity: 1,
	zIndex: 999,
	layerType: "subject",
});
