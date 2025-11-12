import { getLayerIdsInFolder } from "@/lib/helpers/ol";
import { useMapStore } from "@/store/map";

export const getAllDrawLayerIds = (): string[] => {
	try {
		const { config } = useMapStore.getState();
		const elements = config?.layerConfig?.subjectlayer?.elements;

		if (elements) {
			return Array.from(getLayerIdsInFolder(elements, "Draw Layers"));
		}
	} catch (error) {
		console.error("[getAllDrawLayerIds] Error getting draw layer IDs:", error);
	}
	return [];
};

export const isDrawLayer = (layerId: string): boolean => {
	return getAllDrawLayerIds().includes(layerId);
};
