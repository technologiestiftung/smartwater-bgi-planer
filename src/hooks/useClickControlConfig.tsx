"use client";

import FeatureActionMenu from "@/components/MapInteraction/FeatureActionMenu";
import FeatureDetailsModal from "@/components/MapInteraction/FeatureDetailsModal";
import FeatureNoteCard from "@/components/MapInteraction/FeatureNoteCard";
import FeatureTooltip from "@/components/MapInteraction/FeatureTooltip";
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
		ids.push("project_notes");

		if (drawLayerId) {
			ids.push(drawLayerId);
		}
		return ids;
	}, [drawLayerId]);

	const wmsLayerIds = useMemo(() => {
		return currentConfig?.canQueryFeatures || [];
	}, [currentConfig]);

	const layerIds = useMemo(() => {
		return [...vectorLayerIds, ...wmsLayerIds];
	}, [vectorLayerIds, wmsLayerIds]);

	const renderContent = useCallback(
		(feature: any, layerId: string, onClose: () => void) => {
			if (layerId === "project_notes") {
				return (
					<FeatureNoteCard
						features={feature}
						layerId={layerId}
						onClose={onClose}
					/>
				);
			}

			if (drawLayerId && layerId === drawLayerId) {
				return (
					<FeatureActionMenu
						features={feature}
						layerId={layerId}
						onClose={onClose}
					/>
				);
			}

			if (currentConfig?.canQueryFeatures?.includes(layerId)) {
				if (currentConfig.featureDisplay === "modal") {
					return (
						<FeatureDetailsModal
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
