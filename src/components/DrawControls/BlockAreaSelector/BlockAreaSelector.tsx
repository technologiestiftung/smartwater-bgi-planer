"use client";

import { Button } from "@/components/ui/button";
import { getLayerById } from "@/lib/helpers/ol";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { CursorClickIcon } from "@phosphor-icons/react";
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
			const inputLayer = getLayerById(map, "project_btf_planning");
			if (inputLayer) {
				inputLayer.setVisible(visible);
			} else {
				console.warn(
					"[BlockAreaSelector] 'project_btf_planning' layer not found.",
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

		const inputLayer = getLayerById(map, "project_btf_planning");
		const drawLayer = getLayerById(map, drawLayerId);

		if (!drawLayer || !(drawLayer.getSource() instanceof VectorSource)) {
			console.error(
				`[BlockAreaSelector] Draw layer with ID '${drawLayerId}' not found or is not a vector source.`,
			);
			return;
		}

		const drawSource = drawLayer.getSource()!;

		const handleFeatureAdd = (event: CollectionEvent<Feature>) => {
			const clonedFeature = event.element.clone();
			drawSource.addFeature(clonedFeature);
			drawSource.changed();
		};

		const handleFeatureRemove = (event: CollectionEvent<Feature>) => {
			const originalFeature = event.element;
			const featuresToRemove = drawSource
				.getFeatures()
				.filter((f) => f.get("code") === originalFeature.get("code"));
			featuresToRemove.forEach((f) => drawSource.removeFeature(f));

			drawSource.changed();
		};

		if (isActive && inputLayer) {
			toggleRabimoInputVisibility(true);
			drawLayer.setVisible(true);

			const select = new Select({
				layers: [inputLayer],
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
			<Button variant="outline" onClick={toggleSelectionMode}>
				<CursorClickIcon />
				{isActive ? "Stop BTF selektieren" : "BTF selektieren"}
			</Button>
		</div>
	);
};

export default BlockAreaSelector;
