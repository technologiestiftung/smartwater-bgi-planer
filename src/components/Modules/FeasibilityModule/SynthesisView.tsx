"use client";

import { SynthesisView as SharedSynthesisView } from "@/components/Modules/shared/SynthesisView";
import { useLayerFilter } from "@/hooks/use-layer-filter";

const FEASIBILITY_FILTER = (feature: any) => {
	const type = feature.get("noteType");
	return type === "schlecht" || type === undefined || type === null;
};

export function SynthesisView({
	onBackToQuestions,
}: {
	onBackToQuestions: () => void;
}) {
	const ORIGINAL_ID = "module_2_2V5_draw";
	const FILTERED_ID = "module_2_2V5_draw_filtered";

	useLayerFilter(ORIGINAL_ID, FILTERED_ID, FEASIBILITY_FILTER);

	return (
		<SharedSynthesisView
			moduleId="feasibility"
			synthesisViewId="feasibility_synthesis_view"
			description="Hier sehen Sie die Bewertung Ihrer Antworten zur Machbarkeit von Maßnahmen. Grün weist auf gute Machbarkeit, Gelb auf mittlere Machbarkeit und Rot auf geringe Machbarkeit hin. Klicken Sie auf eine Frage, um die Antworten direkt bearbeiten zu können."
			onBackToQuestions={onBackToQuestions}
			layerOverrides={{ [ORIGINAL_ID]: FILTERED_ID }}
		/>
	);
}
