import {
	createAddLayer,
	createApplyConfigLayers,
	createFilteredLayer,
	createGetLayerStatus,
	createHideLayersByPattern,
	createRemoveFilteredLayer,
	createRemoveLayer,
	createSetLayerOpacity,
	createSetLayerStatus,
	createSetLayerVisibility,
	createUpdateFilteredLayer,
	createUpdateLayer,
} from "@/store/layers/actions";
import {
	selectActiveLayerConfig,
	selectLayerConfigById,
} from "@/store/layers/selectors";
import { LayersActions, LayersState } from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const initialState: LayersState = {
	layers: new Map(),
	flattenedLayerElements: [],
	layerConfig: [],
	drawLayerId: null,
	layerConfigId: null,
};

export const useLayersStore = create<LayersState & LayersActions>()(
	devtools(
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
			getActiveLayerConfig: () => selectActiveLayerConfig(get()),
			setLayerConfig: (config) => set({ layerConfig: config }),
			applyConfigLayers: createApplyConfigLayers({
				set,
				get,
				getMapConfig: () => useMapStore.getState().config,
				getMapReady: () => useMapStore.getState().isReady,
			}),
			setDrawLayer: (layerId) => set({ drawLayerId: layerId }),
			setLayerConfigId: (layerId) => set({ layerConfigId: layerId }),
			hideLayersByPattern: createHideLayersByPattern(set, get),
			createFilteredLayer: createFilteredLayer(set, get),
			updateFilteredLayer: createUpdateFilteredLayer(set, get),
			removeFilteredLayer: createRemoveFilteredLayer(set, get),
			setLayerOpacity: createSetLayerOpacity(set, get),
		}),
		{ name: "layersStore" },
	),
);

export { selectActiveLayerConfig, selectLayerConfigById };
