"use client";

import { measureConfigById } from "@/config/measuresConfig";
import { useProjectStore } from "@/store";
import { selectActiveLayerConfig, useLayersStore } from "@/store/layers";
import { FC } from "react";

interface MeasureInfosProps {
	liveMeasureInfo: any;
}

const getPotentialValue = (
	map: Record<string, number> | null,
	key?: string,
) => {
	if (!map || !key) return null;
	const value = map[key];
	return typeof value === "number" ? value : null;
};

const MeasureInfos: FC<MeasureInfosProps> = ({ liveMeasureInfo }) => {
	const layerConfig = useLayersStore((state) => selectActiveLayerConfig(state));
	const areaPotential = useProjectStore(
		(state) => state.accumulatedStats.areaPotential,
	);
	const activeAreaPotential = useProjectStore(
		(state) => state.activeAreaPotential,
	);
	const computedFeatures = useProjectStore((state) => state.computedFeatures);
	const activeAreaId = useProjectStore((state) => state.activeAreaId);

	const measureKey = layerConfig?.id
		? measureConfigById.get(layerConfig.id)?.measureKey
		: undefined;
	const measureName = layerConfig?.name?.trim() || measureKey || "Maßnahme";

	if (!areaPotential) return null;

	// const remainingTotal = getPotentialValue(areaPotential, measureKey);

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
				{/* {remainingTotal !== null && (
					<p>Gesamt: {Number(remainingTotal.toFixed(2))} m²</p>
				)} */}
				{activeRemaining !== null && (
					<p>{Number(activeRemaining.toFixed(2))} m² Kapazität</p>
				)}
			</div>
		</div>
	);
};

export default MeasureInfos;
