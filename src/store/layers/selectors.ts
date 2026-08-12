import { LayerConfigItem, LayersState } from "@/store/layers/types";

export const selectActiveLayerConfig = (
	state: LayersState,
): LayerConfigItem | null => {
	if (!state.layerConfigId) {
		return null;
	}

	return (
		state.layerConfig.find((item) => item.id === state.layerConfigId) ?? null
	);
};

export const selectLayerConfigById = (
	state: LayersState,
	configId: string | null | undefined,
): LayerConfigItem | null => {
	if (!configId) {
		return null;
	}

	return state.layerConfig.find((item) => item.id === configId) ?? null;
};
