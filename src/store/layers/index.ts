import {
	createAddLayer,
	createApplyConfigLayers,
	createGetLayerStatus,
	createRemoveLayer,
	createSetLayerStatus,
	createSetLayerVisibility,
	createUpdateLayer,
} from "@/store/layers/actions";
import { LayersActions, LayersState } from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { create } from "zustand";

const initialState: LayersState = {
	layers: new Map(),
	flattenedLayerElements: [],
	layerConfig: [],
	drawLayerId: null,
};

export const useLayersStore = create<LayersState & LayersActions>(
	(set, get) => ({
		...initialState,
		setLayers: (layers) => set({ layers }),
		setFlattenedLayerElements: (elements) =>
			set({ flattenedLayerElements: elements }),
		addLayer: createAddLayer(set),
		removeLayer: createRemoveLayer(set),
		updateLayer: createUpdateLayer(set),
		setLayerVisibility: createSetLayerVisibility(set, get),
		setLayerStatus: createSetLayerStatus(set, get),
		getLayerStatus: createGetLayerStatus(get),
		setLayerConfig: (config) => set({ layerConfig: config }),
		applyConfigLayers: createApplyConfigLayers(
			set,
			get,
			() => useMapStore.getState().config,
		),
		setDrawLayer: (layerId) => set({ drawLayerId: layerId }),
	}),
);
