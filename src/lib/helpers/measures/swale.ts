const SWALE_LAYER_CONFIG_IDS = new Set(["3V1", "3V2", "3V3", "3V4", "3V5", "3V6"]);

export const isSwaleLayerConfigId = (
	layerConfigId: string | null | undefined,
) => Boolean(layerConfigId && SWALE_LAYER_CONFIG_IDS.has(layerConfigId));
