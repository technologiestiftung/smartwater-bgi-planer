import { SynthesisView as SharedSynthesisView } from "@/components/Modules/shared/SynthesisView";

interface SynthesisViewProps {
	onBackToQuestions: () => void;
}

export function SynthesisView({ onBackToQuestions }: SynthesisViewProps) {
	return (
		<SharedSynthesisView
			moduleId="needForAction"
			synthesisViewId="synthesis_view"
			description="Hier sehen Sie die Einstufung Ihrer Antworten nach Handlungsbedarfen. Grün weist auf keinen, Gelb auf mittleren und Rot auf hohen Handlungsbedarf hin. Klicken Sie auf eine Frage, um die Antworten direkt bearbeiten zu können"
			colorLogic="handlungsbedarf"
			onBackToQuestions={onBackToQuestions}
		/>
	);
}
