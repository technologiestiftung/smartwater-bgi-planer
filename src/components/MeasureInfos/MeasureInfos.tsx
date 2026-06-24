"use client";

import { measureConfigById } from "@/config/measuresConfig";
import { isSwaleLayerConfigId } from "@/lib/helpers/measures/swale";
import { useProjectStore } from "@/store";
import { selectActiveLayerConfig, useLayersStore } from "@/store/layers";
import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import type { MeasureValues } from "@/types/measures";
import { FC } from "react";

interface MeasureInfosProps {
	liveMeasureInfo: any;
}

const getPotentialValue = (
	map: MeasureValues | null,
	key?: keyof MeasureValues,
) => {
	if (!map || !key) return null;
	const value = map[key];
	return typeof value === "number" ? value : null;
};

const MeasureInfos: FC<MeasureInfosProps> = ({ liveMeasureInfo }) => {
	const layerConfig = useLayersStore((state) => selectActiveLayerConfig(state));
	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const areaPotential = useProjectStore(
		(state) => state.accumulatedStats.areaPotential,
	);
	const activeAreaPotential = useProjectStore(
		(state) => state.activeAreaPotential,
	);
	const computedFeatures = useProjectStore((state) => state.computedFeatures);
	const activeAreaId = useProjectStore((state) => state.activeAreaId);
	const selectedConnectedAreaId = useUiStore(
		(state) => state.selectedConnectedAreaId,
	);
	const connectedAreas = useScenarioStore((state) =>
		state.activeScenarioId
			? (state.scenarios[state.activeScenarioId]?.connectedAreas ?? [])
			: [],
	);

	const isSwaleMeasure = isSwaleLayerConfigId(layerConfigId);
	const selectedConnectedArea = connectedAreas.find(
		(a) => a.id === selectedConnectedAreaId,
	);

	const measureKey = layerConfig?.id
		? measureConfigById.get(layerConfig.id)?.measureKey
		: undefined;
	const measureName = layerConfig?.name?.trim() || measureKey || "Maßnahme";

	if (!areaPotential) return null;

	const activeFeature = computedFeatures.find((f) => f.code === activeAreaId);
	const activeRemaining =
		measureKey && activeAreaPotential
			? getPotentialValue(
					activeFeature?.areaPotential ?? activeAreaPotential,
					measureKey,
				)
			: null;

	return (
		<div className="MeasureInfos-root">
			<div className="bg-background border-primary text-primary absolute right-0 bottom-full z-10 mb-2 w-64 border-2 p-2 text-xs shadow-lg">
				<p
					className={`font-semibold ${liveMeasureInfo.isOverPotential ? "text-destructive" : ""}`}
				>
					{liveMeasureInfo.area} {measureName} geplant
				</p>
				{activeRemaining !== null && (
					<p>{Math.round(activeRemaining)} m² Kapazität</p>
				)}
				{isSwaleMeasure && selectedConnectedArea && (
					<p>
						{Math.round(selectedConnectedArea.area)} m² angeschlossene Fläche
					</p>
				)}
			</div>
		</div>
	);
};

export default MeasureInfos;
