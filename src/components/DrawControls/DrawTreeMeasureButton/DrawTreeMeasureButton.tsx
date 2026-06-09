/* eslint-disable no-nested-ternary */
"use client";

import { Button } from "@/components/ui/button";
import { useLayersStore, useMapStore } from "@/store";
import { LAYER_IDS } from "@/types/shared";
import { LeafIcon, PlantIcon, TreeIcon } from "@phosphor-icons/react";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

const sizes: ("sm" | "md" | "lg")[] = ["sm", "md", "lg"];

export const DrawTreeMeasureButton: FC = () => {
	const map = useMapStore((s) => s.map);
	const { drawLayerId, setLayerVisibility } = useLayersStore(
		useShallow((s) => ({
			drawLayerId: s.drawLayerId,
			layerConfigId: s.layerConfigId,
			setLayerVisibility: s.setLayerVisibility,
		})),
	);

	// todo: simply safe the amount of sm, md and lg sized trees in the store

	useEffect(() => {
		if (!map || !drawLayerId) return;
		setLayerVisibility(drawLayerId, true);
		setLayerVisibility(LAYER_IDS.PROJECT_BTF_PLANNING, true);
	}, [map, drawLayerId, setLayerVisibility]);

	useEffect(() => {
		if (!map) return;
		console.log("[DrawTreeMeasureButton] map::", map);
	}, [map]);

	const handleSizeClick = (s: "sm" | "md" | "lg") => {
		console.log("[DrawTreeMeasureButton] size::", s);
	};

	return (
		<div className="DrawTreeMeasureButton-root flex gap-2">
			{sizes.map((s) => (
				<Button key={s} variant="outline" onClick={() => handleSizeClick(s)}>
					{s === "sm" ? (
						<>
							<LeafIcon />
							Kleiner Baum
						</>
					) : s === "md" ? (
						<>
							<PlantIcon />
							Mittelgroßer Baum
						</>
					) : (
						<>
							<TreeIcon />
							Großer Baum
						</>
					)}
				</Button>
			))}
		</div>
	);
};
