"use client";

import FeatureActionMenu from "@/components/FeatureDetailViews/FeatureActionMenu/FeatureActionMenu";
import FeatureDetailsModal from "@/components/FeatureDetailViews/FeatureDetailsModal/FeatureDetailsModal";
import FeatureNoteCard from "@/components/FeatureDetailViews/FeatureNoteCard/FeatureNoteCard";
import FeatureTooltip from "@/components/FeatureDetailViews/FeatureTooltip/FeatureTooltip";
import MeasureDetailsCard from "@/components/FeatureDetailViews/MeasureDetailsCard/MeasureDetailsCard";
import { getFeatureAttributes } from "@/lib/helpers/ol/feature";
import { resolveMeasureId } from "@/lib/helpers/ol/measureFeature";
import { useLayersStore } from "@/store/layers";
import type Feature from "ol/Feature";
import type { Geometry } from "ol/geom";
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
		(
			feature: Feature<Geometry> | null,
			layerId: string,
			onClose: () => void,
		) => {
			const normalizedFeature = feature ?? undefined;
			const attributes = getFeatureAttributes(normalizedFeature);

			if (layerId === "project_notes") {
				return (
					<FeatureNoteCard
						features={normalizedFeature}
						layerId={layerId}
						onClose={onClose}
					/>
				);
			}

			if (drawLayerId && layerId === drawLayerId) {
				const measureId = resolveMeasureId(normalizedFeature);

				if (measureId) {
					return (
						<MeasureDetailsCard
							measureId={measureId}
							feature={normalizedFeature}
							layerId={layerId}
							onClose={onClose}
						/>
					);
				}

				return (
					<FeatureActionMenu
						features={normalizedFeature}
						layerId={layerId}
						onClose={onClose}
					/>
				);
			}

			if (currentConfig?.canQueryFeatures?.includes(layerId)) {
				if (currentConfig.featureDisplay === "modal") {
					return (
						<FeatureDetailsModal
							attributes={attributes}
							layerId={layerId}
							onClose={onClose}
						/>
					);
				}

				return (
					<FeatureTooltip
						attributes={attributes ?? {}}
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
