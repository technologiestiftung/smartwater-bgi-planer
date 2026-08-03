"use client";

import { FeatureActionMenu } from "@/components/FeatureDetailViews/FeatureActionMenu/FeatureActionMenu";
import { FeatureDetailsModal } from "@/components/FeatureDetailViews/FeatureDetailsModal/FeatureDetailsModal";
import { FeatureNoteCard } from "@/components/FeatureDetailViews/FeatureNoteCard/FeatureNoteCard";
import { FeatureTooltip } from "@/components/FeatureDetailViews/FeatureTooltip/FeatureTooltip";
import { MeasureDetailsCard } from "@/components/FeatureDetailViews/MeasureDetailsCard/MeasureDetailsCard";
import { resolveMeasureId } from "@/lib/helpers/ol/measureFeature";
import { selectActiveLayerConfig, useLayersStore } from "@/store/layers";
import { LAYER_IDS } from "@/types/shared";
import type Feature from "ol/Feature";
import type { Geometry } from "ol/geom";
import { useCallback, useMemo } from "react";

export const useClickControlConfig = () => {
	const currentConfig = useLayersStore(selectActiveLayerConfig);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);

	const vectorLayerIds = useMemo(() => {
		const ids: string[] = [];
		ids.push("project_notes");

		if (drawLayerId) {
			ids.push(drawLayerId);
		}

		const connectedAreaDrawId = LAYER_IDS.CONNECTED_AREA_DRAW;
		if (
			currentConfig?.visibleLayerIds?.includes(connectedAreaDrawId) &&
			!ids.includes(connectedAreaDrawId)
		) {
			ids.push(connectedAreaDrawId);
		}

		return ids;
	}, [drawLayerId, currentConfig]);

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
					return <MeasureDetailsCard measureId={measureId} onClose={onClose} />;
				}

				return (
					<FeatureActionMenu
						features={normalizedFeature}
						layerId={layerId}
						onClose={onClose}
					/>
				);
			}
			if (
				layerId === LAYER_IDS.CONNECTED_AREA_DRAW &&
				currentConfig?.id === LAYER_IDS.CONNECTED_AREA_DRAW
			) {
				return (
					<FeatureActionMenu
						features={normalizedFeature}
						layerId={layerId}
						onClose={onClose}
					/>
				);
			}
			if (currentConfig?.canQueryFeatures?.includes(layerId) && feature) {
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
