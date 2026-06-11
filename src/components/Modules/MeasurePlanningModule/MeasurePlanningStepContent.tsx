"use client";

import { MetricIconBadges } from "@/components/MetricIconBadges/MetricIconBadges";
import { RichTextWithLinks } from "@/components/RichTextWithLinks/RichTextWithLinks";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getLayerById } from "@/lib/helpers/ol";
import { useMapStore } from "@/store/map";
import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import { LayerConfigItem } from "@/store/layers/types";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { ConnectedAreaSelection } from "./ConnectedAreaSelection";
import PotentialsContent from "./PotentialsContent";

interface MeasurePlanningStepContentProps {
	layerConfig: LayerConfigItem;
	metricIcons?: string[];
}

interface MeasurePlanningLegendProps {
	layerConfig: LayerConfigItem;
}

function MeasurePlanningLegend({ layerConfig }: MeasurePlanningLegendProps) {
	return (
		<div className="mt-auto pt-6 pb-4">
			<Accordion type="multiple">
				<AccordionItem value="legend" className="border-neutral-mid px-4">
					<AccordionTrigger className="text-primary font-bold hover:no-underline">
						{layerConfig.legendTitle || "Legende"}
					</AccordionTrigger>
					<AccordionContent className="pb-4">
						{layerConfig.legendSrc ? (
							<Image
								src={layerConfig.legendSrc}
								alt="Legende für die Karte"
								width={620}
								height={260}
								className="h-auto max-w-full"
							/>
						) : (
							<p className="text-muted-foreground text-sm">
								Keine Legende verfügbar.
							</p>
						)}
					</AccordionContent>
				</AccordionItem>

				{layerConfig.canDrawMeasures && (
					<AccordionItem value="measures" className="border-neutral-mid px-4">
						<AccordionTrigger className="text-primary font-bold hover:no-underline">
							Maßnahmen
						</AccordionTrigger>
						<AccordionContent>
							{layerConfig.measurementSrc ? (
								<Image
									src={layerConfig.measurementSrc}
									alt="Legende für Maßnahmen"
									width={620}
									height={260}
									className="h-auto max-w-full"
								/>
							) : (
								<p className="text-muted-foreground text-sm">
									Keine Maßnahmenlegende verfügbar.
								</p>
							)}
						</AccordionContent>
					</AccordionItem>
				)}
			</Accordion>
		</div>
	);
}

export function MeasurePlanningStepContent({
	layerConfig,
	metricIcons = [],
}: MeasurePlanningStepContentProps) {
	const showLegendAccordion =
		Boolean(layerConfig.legendSrc) || Boolean(layerConfig.canDrawMeasures);
	const confirmedRef = useRef(false);
	const map = useMapStore((s) => s.map);
	const hasDrafts = useUiStore(
		(s) => s.draftMeasureIds.length > 0 || s.draftConnectedAreaIds.length > 0,
	);

	const removeDraftFeaturesFromLayer = useCallback(
		(draftMeasureIds: string[], draftConnectedAreaIds: string[]) => {
			if (!map || !layerConfig.drawLayerId) return;
			const draftIds = new Set([...draftMeasureIds, ...draftConnectedAreaIds]);
			const layer = getLayerById(
				map,
				layerConfig.drawLayerId,
			) as VectorLayer<VectorSource> | null;
			const source = layer?.getSource();
			if (!source) return;
			for (const feature of source.getFeatures()) {
				const mId = feature.get("measureId") as string | undefined;
				const caId = feature.get("connectedAreaId") as string | undefined;
				if ((mId && draftIds.has(mId)) || (caId && draftIds.has(caId))) {
					source.removeFeature(feature);
				}
			}
			const caLayer = getLayerById(
				map,
				LAYER_IDS.CONNECTED_AREA_DRAW,
			) as VectorLayer<VectorSource> | null;
			const caSource = caLayer?.getSource();
			if (!caSource) return;
			for (const feature of caSource.getFeatures()) {
				const caId = feature.get("connectedAreaId") as string | undefined;
				if (caId && draftConnectedAreaIds.includes(caId)) {
					caSource.removeFeature(feature);
				}
			}
		},
		[map, layerConfig.drawLayerId],
	);

	const removeDraftMeasures = useCallback(() => {
		const { draftMeasureIds, draftConnectedAreaIds, clearDraftMeasures } =
			useUiStore.getState();
		if (draftMeasureIds.length === 0 && draftConnectedAreaIds.length === 0)
			return;

		const {
			activeScenarioId,
			scenarios,
			removeMeasure,
			removeConnectedArea,
			markConnectedAreaUsed,
		} = useScenarioStore.getState();
		if (!activeScenarioId) return;

		removeDraftFeaturesFromLayer(draftMeasureIds, draftConnectedAreaIds);

		for (const measureId of draftMeasureIds) {
			removeMeasure(activeScenarioId, measureId);
		}

		for (const connectedAreaId of draftConnectedAreaIds) {
			removeConnectedArea(activeScenarioId, connectedAreaId);
		}

		const scenario = scenarios[activeScenarioId];
		if (scenario) {
			for (const ca of scenario.connectedAreas) {
				if (ca.usedByMeasureId === "trees") {
					markConnectedAreaUsed(activeScenarioId, ca.id, null);
				}
			}
		}

		clearDraftMeasures();
	}, [removeDraftFeaturesFromLayer]);

	const handleConfirm = () => {
		confirmedRef.current = true;
		useUiStore.getState().confirmDraftMeasures();
	};

	useEffect(() => {
		return () => {
			if (!confirmedRef.current) {
				removeDraftMeasures();
			}
		};
	}, [removeDraftMeasures]);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mt-4">
				<div className="mb-4">
					<MetricIconBadges metricIcons={metricIcons} />
					{layerConfig.question && (
						<p className="mb-2 font-semibold">{layerConfig.question}</p>
					)}
					{layerConfig.description && (
						<div className="wrap-break-word">
							<RichTextWithLinks text={layerConfig.description} />
						</div>
					)}
					<PotentialsContent layerConfig={layerConfig} />
					<ConnectedAreaSelection
						layerConfigId={layerConfig.id}
						drawLayerId={layerConfig.drawLayerId}
						layerName={layerConfig.name || layerConfig.question || "Maßnahme"}
					/>
					<div className="mt-6">
						<Button onClick={handleConfirm} disabled={!hasDrafts}>
							Bestätigen
						</Button>
					</div>
				</div>
			</div>
			{showLegendAccordion && (
				<MeasurePlanningLegend layerConfig={layerConfig} />
			)}
		</div>
	);
}
