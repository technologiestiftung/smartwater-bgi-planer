import FeatureModal from "@/components/FeatureDisplayControl/FeatureModal";
import FeatureTooltip from "@/components/FeatureDisplayControl/FeatureTooltip";
import FeatureMenu from "@/components/FeatureMenu/FeatureMenu";
import NoteCard from "@/components/NoteCard/NoteCard";
import { useLayersStore } from "@/store/layers";
import { useCallback, useMemo } from "react";

export const useClickControlConfig = () => {
	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const layerConfigs = useLayersStore((state) => state.layerConfig);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);

	const currentConfig = useMemo(
		() => layerConfigs.find((c) => c.id === layerConfigId),
		[layerConfigs, layerConfigId],
	);

	const vectorLayerIds = useMemo(() => {
		const ids: string[] = [];
		ids.push("module1_notes");

		if (drawLayerId) {
			ids.push(drawLayerId);
		}
		return ids;
	}, [drawLayerId]);

	const wmsLayerIds = useMemo(() => {
		return currentConfig?.canQueryFeatures || [];
	}, [currentConfig]);

	// Alle Layer IDs zusammen für das Interface
	const layerIds = useMemo(() => {
		return [...vectorLayerIds, ...wmsLayerIds];
	}, [vectorLayerIds, wmsLayerIds]);

	const renderContent = useCallback(
		(feature: any, layerId: string, onClose: () => void) => {
			if (layerId === "module1_notes") {
				return (
					<NoteCard features={feature} layerId={layerId} onClose={onClose} />
				);
			}

			if (drawLayerId && layerId === drawLayerId) {
				return (
					<FeatureMenu features={feature} layerId={layerId} onClose={onClose} />
				);
			}

			if (currentConfig?.canQueryFeatures?.includes(layerId)) {
				if (currentConfig.featureDisplay === "modal") {
					return (
						<FeatureModal
							attributes={
								feature?.getProperties ? feature.getProperties() : feature
							}
							layerId={layerId}
							onClose={onClose}
						/>
					);
				}

				return (
					<FeatureTooltip
						attributes={
							feature?.getProperties ? feature.getProperties() : feature
						}
						layerId={layerId}
						onClose={onClose}
					/>
				);
			}

			return null;
		},
		[currentConfig, drawLayerId],
	);

	return {
		layerIds,
		vectorLayerIds,
		wmsLayerIds,
		renderContent,
		currentConfig,
	};
};
