"use client";

import measuresConfig from "@/config/measuresConfig.json";
import { useProjectStore } from "@/store";
import { LayerConfigItem } from "@/store/layers/types";
import type { MeasureConfig } from "@/types/measures";
import { FC } from "react";

const measureConfigById = new Map(
	(measuresConfig as MeasureConfig[]).map((item) => [item.id, item]),
);

interface PotentialsContentProps {
	layerConfig: LayerConfigItem;
}

const PotentialsContent: FC<PotentialsContentProps> = ({ layerConfig }) => {
	const areaPotential = useProjectStore((state) => state.areaPotential);
	const activeAreaPotential = useProjectStore(
		(state) => state.activeAreaPotential,
	);
	const measureKey = measureConfigById.get(layerConfig.id)?.measureKey;

	if (!areaPotential || !measureKey) {
		return null;
	}

	return (
		<div className="PotentialsContent-root mt-4">
			<p>Gesamt: {Number(areaPotential[measureKey].toFixed(2))} m²</p>
			{activeAreaPotential && (
				<p>
					Potentialfläche: {Number(activeAreaPotential[measureKey].toFixed(2))}{" "}
					m²
				</p>
			)}
		</div>
	);
};

export default PotentialsContent;
