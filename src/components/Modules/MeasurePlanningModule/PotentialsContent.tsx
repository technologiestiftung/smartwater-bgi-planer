"use client";

import { measureConfigById } from "@/config/measuresConfig";
import { useProjectStore } from "@/store";
import { LayerConfigItem } from "@/store/layers/types";
import { FC } from "react";

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
	const measureKey = measureConfigById.get(layerConfig.id)?.measureKey;

	if (!areaPotential || !measureKey) {
		return null;
	}

	const remainingTotal = areaPotential[measureKey];

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

		return activeFeature.areaPotential[measureKey];
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
