"use client";

import { getModuleStepMeasure } from "@/components/Modules/shared/moduleConfig";
import { measureConfigById } from "@/config/measuresConfig";
import { isSwaleLayerConfigId } from "@/lib/helpers/measures/swale";
import { useProjectStore } from "@/store";
import { selectActiveLayerConfig, useLayersStore } from "@/store/layers";
import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import type { LiveMeasureInfo, MeasureValues } from "@/types/measures";
import { FC } from "react";

interface MeasureInfosProps {
	liveMeasureInfo: LiveMeasureInfo;
}

const MeasureInfos: FC<MeasureInfosProps> = ({ liveMeasureInfo }) => {
	const layerConfig = useLayersStore((state) => selectActiveLayerConfig(state));
	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const activeAreaPotential = useProjectStore(
		(state) => state.activeAreaPotential,
	);
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

	const measureName =
		(layerConfigId
			? getModuleStepMeasure("measurePlanning", layerConfigId)?.title
			: undefined) ??
		layerConfig?.name?.trim() ??
		"";

	const measureKey = layerConfig?.id
		? measureConfigById.get(layerConfig.id)?.measureKey
		: undefined;

	const activeRemaining =
		measureKey && activeAreaPotential
			? (activeAreaPotential[measureKey as keyof MeasureValues] ?? null)
			: null;

	return (
		<div className="MeasureInfos-root">
			<div
				role="status"
				aria-live="polite"
				className="bg-background border-primary text-primary absolute right-0 bottom-full z-10 mb-2 w-64 border-2 p-2 text-xs shadow-lg"
			>
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
