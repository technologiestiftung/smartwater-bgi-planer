"use client";

import { useMemo } from "react";
import { useLayersStore } from "@/store/layers";
import FeatureDisplayControl from "./FeatureDisplayControl";

const FeatureInfoManager = () => {
	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const layerConfig = useLayersStore((state) => state.layerConfig);

	const activeConfig = useMemo(
		() => layerConfig.find((c) => c.id === layerConfigId),
		[layerConfig, layerConfigId],
	);

	if (
		!activeConfig?.canQueryFeatures ||
		activeConfig.canQueryFeatures.length === 0
	) {
		return null;
	}

	const queryableLayerIds = activeConfig.canQueryFeatures;
	const displayMode = activeConfig.featureDisplay || "tooltip";

	const layerDisplayConfigs = queryableLayerIds.reduce(
		(acc, id) => {
			acc[id] = displayMode as "tooltip" | "modal";
			return acc;
		},
		{} as Record<string, "tooltip" | "modal">,
	);

	return (
		<FeatureDisplayControl
			queryableLayerIds={queryableLayerIds}
			layerDisplayConfigs={layerDisplayConfigs}
		/>
	);
};

export default FeatureInfoManager;
