import { LayerElementBase, LayerFolder } from "@/store/layers/types";
import VectorLayer from "ol/layer/Vector";
import type Map from "ol/Map";
import { Vector as VectorSource } from "ol/source";
import { getLayerById } from "./mapHelpers";

export type LayerTreeElement = LayerElementBase | LayerFolder;

export interface WMSValidationResult {
	isValid: boolean;
	error?: string;
	hasLayers?: boolean;
}

export const validateWMSUrl = (url: string): WMSValidationResult => {
	try {
		const parsedUrl = new URL(url);

		const urlString = parsedUrl.toString().toLowerCase();
		const hasWmsIndicator =
			urlString.includes("wms") ||
			urlString.includes("service=wms") ||
			parsedUrl.searchParams.get("service")?.toLowerCase() === "wms";

		if (!hasWmsIndicator) {
			return { isValid: false, error: "URL scheint kein WMS Service zu sein" };
		}

		return { isValid: true };
	} catch {
		return { isValid: false, error: "Ungültige URL" };
	}
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
