"use client";

import measuresConfig from "@/config/measuresConfig.json";
import { simulationEngine } from "@/lib/simulation/simulationEngine";
import { useProjectStore } from "@/store";
import { LayerConfigItem } from "@/store/layers/types";
import { useScenarioStore } from "@/store/scenario";
import type { MeasureConfig } from "@/types/measures";
import { FC } from "react";

const measureConfigById = new Map(
	(measuresConfig as MeasureConfig[]).map((item) => [item.id, item]),
);

interface PotentialsContentProps {
	layerConfig: LayerConfigItem;
}

const PotentialsContent: FC<PotentialsContentProps> = ({ layerConfig }) => {
	const areaPotential = useProjectStore(
		(state) => state.accumulatedStats.areaPotential,
	);
	const activeAreaPotential = useProjectStore(
		(state) => state.activeAreaPotential,
	);
	const computedFeatures = useProjectStore((state) => state.computedFeatures);
	const activeAreaId = useProjectStore((state) => state.activeAreaId);
	const measures = useScenarioStore((state) => {
		if (!state.activeScenarioId) return [];
		return state.scenarios[state.activeScenarioId]?.measures ?? [];
	});
	const measureKey = measureConfigById.get(layerConfig.id)?.measureKey;

	if (!areaPotential || !measureKey) {
		return null;
	}

	const remainingTotal = computedFeatures.reduce((sum, item) => {
		const code = item.code;
		const areaMeasures = measures.filter((measure) => measure.code === code);
		const remaining = simulationEngine.computeRemainingPotential(
			item.computedArea,
			areaMeasures,
		);
		return sum + remaining[measureKey];
	}, 0);

	const activeRemaining = (() => {
		if (!activeAreaPotential || !activeAreaId) {
			return null;
		}

		const activeFeature = computedFeatures.find(
			(feature) => feature.code === activeAreaId,
		);
		if (!activeFeature) {
			return activeAreaPotential[measureKey];
		}

		const remaining = simulationEngine.computeRemainingPotential(
			activeFeature.computedArea,
			measures.filter((measure) => measure.code === activeAreaId),
		);
		return remaining[measureKey];
	})();

	return (
		<div className="PotentialsContent-root mt-4">
			<p>Gesamt: {Number(remainingTotal.toFixed(2))} m²</p>
			{activeRemaining !== null && (
				<p>Potentialfläche: {Number(activeRemaining.toFixed(2))} m²</p>
			)}
		</div>
	);
};

export default PotentialsContent;
