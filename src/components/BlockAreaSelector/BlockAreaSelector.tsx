"use client";

import { Button } from "@/components/ui/button";
import { getLayerById } from "@/lib/helper/mapHelpers";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { Feature } from "ol";
import { CollectionEvent } from "ol/Collection";
import { click } from "ol/events/condition.js";
import Select from "ol/interaction/Select.js";
import { Vector as VectorSource } from "ol/source.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";

const BlockAreaSelector: FC = () => {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);

	const selectInteractionRef = useRef<Select | null>(null);
	const [isActive, setIsActive] = useState(false);

	const toggleRabimoInputVisibility = useCallback(
		(visible: boolean) => {
			const rabimoLayer = getLayerById(map, "rabimo_input_2025");
			if (rabimoLayer) {
				rabimoLayer.setVisible(visible);
			} else {
				console.warn(
					"[BlockAreaSelector] 'rabimo_input_2025' layer not found.",
				);
			}
		},
		[map],
	);

	const toggleSelectionMode = useCallback(() => {
		if (!map) return;
		setIsActive((prev) => !prev);
	}, [map]);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		const rabimoInputLayer = getLayerById(map, "rabimo_input_2025");
		const drawLayer = getLayerById(map, drawLayerId);

		if (!drawLayer || !(drawLayer.getSource() instanceof VectorSource)) {
			console.error(
				`[BlockAreaSelector] Draw layer with ID '${drawLayerId}' not found or is not a vector source.`,
			);
			return;
		}

		const drawSource = drawLayer.getSource()!;

		const handleFeatureAdd = (event: CollectionEvent<Feature>) => {
			drawSource.addFeature(event.element.clone());
		};

		const handleFeatureRemove = (event: CollectionEvent<Feature>) => {
			const originalFeature = event.element;
			const featuresToRemove = drawSource.getFeatures().filter(
				(f) => f.get("code") === originalFeature.get("code"), // or whatever unique property exists
			);
			featuresToRemove.forEach((f) => drawSource.removeFeature(f));
		};

		if (isActive && rabimoInputLayer) {
			toggleRabimoInputVisibility(true);
			drawLayer.setVisible(true);

			const select = new Select({
				layers: [rabimoInputLayer],
				condition: click,
				addCondition: click,
				removeCondition: click,
				toggleCondition: click,
				multi: true,
			});

			selectInteractionRef.current = select;

			select.getFeatures().on("add", handleFeatureAdd);
			select.getFeatures().on("remove", handleFeatureRemove);

			map.addInteraction(select);
		}

		return () => {
			if (selectInteractionRef.current) {
				selectInteractionRef.current.getFeatures().un("add", handleFeatureAdd);
				selectInteractionRef.current
					.getFeatures()
					.un("remove", handleFeatureRemove);
				map.removeInteraction(selectInteractionRef.current);
				selectInteractionRef.current = null;
			}
			toggleRabimoInputVisibility(false);
		};
	}, [map, isActive, toggleRabimoInputVisibility, drawLayerId]);

	return (
		<div className="BlockAreaSelector-root">
			<Button onClick={toggleSelectionMode}>
				{isActive ? "Stop BTF Selection" : "BTF selektieren"}
			</Button>
		</div>
	);
};

export default BlockAreaSelector;
