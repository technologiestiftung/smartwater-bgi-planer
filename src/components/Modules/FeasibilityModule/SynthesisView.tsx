"use client";

import { SynthesisView as SharedSynthesisView } from "@/components/Modules/shared/SynthesisView";

interface SynthesisViewProps {
	onBackToQuestions: () => void;
}

export function SynthesisView({ onBackToQuestions }: SynthesisViewProps) {
	return (
		<SharedSynthesisView
			moduleId="feasibility"
			synthesisViewId="feasibility_synthesis_view"
			description="Hier sehen Sie die Bewertung Ihrer Antworten zur Machbarkeit von Maßnahmen. Grün weist auf gute Machbarkeit, Gelb auf mittlere Machbarkeit und Rot auf geringe Machbarkeit hin. Klicken Sie auf eine Frage, um die Antworten direkt bearbeiten zu können."
			colorLogic="machbarkeit"
			onBackToQuestions={onBackToQuestions}
		/>
	);
}
