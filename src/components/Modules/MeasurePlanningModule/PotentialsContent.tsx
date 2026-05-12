"use client";

import { useProjectStore } from "@/store";
import { LayerConfigItem } from "@/store/layers/types";
import { FC, useEffect } from "react";

interface PotentialsContentProps {
	layerConfig: LayerConfigItem;
}

const PotentialsContent: FC<PotentialsContentProps> = ({ layerConfig }) => {
	const areaPotential = useProjectStore((state) => state.areaPotential);

	console.log("[PotentialsContent] layerConfig::", layerConfig);

	useEffect(() => {
		console.log("[MeasurePlanningStepContent] areaPotentials", areaPotential);
	}, [areaPotential]);

	return (
		<div className="PotentialsContent-root">
			{areaPotential && (
				<div>
					<p>{Number(areaPotential.green_roof_ext.toFixed(2))} m²</p>
					<p>{Number(areaPotential.green_roof_int.toFixed(2))} m²</p>
					<p>{Number(areaPotential.unpaving.toFixed(2))} m²</p>
					<p>{Number(areaPotential.permeable_paving.toFixed(2))} m²</p>
					<p>{Number(areaPotential.to_inf_mulde.toFixed(2))} m²</p>
					<p>{Number(areaPotential.to_inf_rigole.toFixed(2))} m²</p>
					<p>{Number(areaPotential.to_inf_mulde_rigole.toFixed(2))} m²</p>
					<p>{Number(areaPotential.to_retention.toFixed(2))} m²</p>
				</div>
			)}
		</div>
	);
};

export default PotentialsContent;
