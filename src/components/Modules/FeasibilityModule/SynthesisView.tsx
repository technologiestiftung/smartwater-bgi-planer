"use client";

import { SynthesisView as SharedSynthesisView } from "@/components/Modules/shared/SynthesisView";
import { useLayersStore } from "@/store/layers";
import { useEffect } from "react";

interface SynthesisViewProps {
	onBackToQuestions: () => void;
}

export function SynthesisView({ onBackToQuestions }: SynthesisViewProps) {
	const createFilteredLayer = useLayersStore(
		(state) => state.createFilteredLayer,
	);
	const updateFilteredLayer = useLayersStore(
		(state) => state.updateFilteredLayer,
	);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);
	const filteredLayerExists = useLayersStore((state) =>
		state.layers.has("module_2_2V5_draw_filtered"),
	);

	const FILTERED_LAYER_ID = "module_2_2V5_draw_filtered";
	const ORIGINAL_LAYER_ID = "module_2_2V5_draw";

	const filterFunction = (feature: any) => {
		const noteType = feature.get("noteType");
		return (
			noteType === "schlecht" || noteType === undefined || noteType === null
		);
	};

	useEffect(() => {
		if (!filteredLayerExists) {
			createFilteredLayer(ORIGINAL_LAYER_ID, filterFunction, FILTERED_LAYER_ID);
		} else {
			updateFilteredLayer(ORIGINAL_LAYER_ID, filterFunction, FILTERED_LAYER_ID);
		}

		setLayerVisibility(ORIGINAL_LAYER_ID, false);

		return () => {
			setLayerVisibility(FILTERED_LAYER_ID, false);
			setLayerVisibility(ORIGINAL_LAYER_ID, true);
		};
	}, [
		filteredLayerExists,
		createFilteredLayer,
		updateFilteredLayer,
		setLayerVisibility,
	]);

	return (
		<SharedSynthesisView
			moduleId="feasibility"
			synthesisViewId="feasibility_synthesis_view"
			description="Hier sehen Sie die Bewertung Ihrer Antworten zur Machbarkeit von Maßnahmen. Grün weist auf gute Machbarkeit, Gelb auf mittlere Machbarkeit und Rot auf geringe Machbarkeit hin. Klicken Sie auf eine Frage, um die Antworten direkt bearbeiten zu können."
			colorLogic="machbarkeit"
			onBackToQuestions={onBackToQuestions}
			layerOverrides={{
				[ORIGINAL_LAYER_ID]: FILTERED_LAYER_ID,
			}}
		/>
	);
}
