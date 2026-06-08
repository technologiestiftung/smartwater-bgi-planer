"use client";

import { measureConfigById } from "@/config/measuresConfig";
import { useProjectStore } from "@/store";
import { selectActiveLayerConfig, useLayersStore } from "@/store/layers";
import { FC } from "react";

interface MeasureInfosProps {
	liveMeasureInfo: any;
}

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
	const measureKey = layerConfig
		? measureConfigById.get(layerConfig.id)?.measureKey
		: undefined;
	const measureName = layerConfig?.name?.trim() || measureKey || "Maßnahme";

	if (!areaPotential) {
		return null;
	}

	const remainingTotal = measureKey ? areaPotential[measureKey] : null;

	const activeRemaining = (() => {
		if (!measureKey || !activeAreaPotential || !activeAreaId) {
			return null;
		}

		const activeFeature = computedFeatures.find(
			(feature) => feature.code === activeAreaId,
		);

		console.log("activeFeature", activeFeature);

		if (!activeFeature) {
			return activeAreaPotential[measureKey];
		}

		return activeFeature.areaPotential[measureKey];
	})();

	return (
		<div className="MeasureInfos-root">
			<div className="bg-background border-primary text-primary absolute right-0 bottom-full z-10 mb-2 w-64 border-2 p-2 text-xs shadow-lg">
				<p
					className={`font-semibold ${liveMeasureInfo.isOverPotential ? "text-destructive" : ""}`}
				>
					Fläche: {liveMeasureInfo.area} {measureName}
				</p>
				{remainingTotal !== null && (
					<p>Gesamt: {Number(remainingTotal.toFixed(2))} m²</p>
				)}
				{activeRemaining !== null && (
					<p>{Number(activeRemaining.toFixed(2))} m² Kapazität</p>
				)}
				{/* todo add angeschlossene Fläche */}
				{/* {(
					<p>{} m² angeschlossene Fläche</p>
				)} */}
			</div>
		</div>
	);
};

export default MeasureInfos;
