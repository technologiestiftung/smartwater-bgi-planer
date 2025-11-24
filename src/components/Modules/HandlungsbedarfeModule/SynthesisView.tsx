import { QuestionBadge } from "@/components/Modules/HandlungsbedarfeModule/QuestionBadge";
import { steps } from "@/components/Modules/HandlungsbedarfeModule/constants";
import { Button } from "@/components/ui/button";
import { useAnswersStore } from "@/store/answers";
import { EyeSlashIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

interface SynthesisViewProps {
	onBackToQuestions: () => void;
}

export function SynthesisView({ onBackToQuestions }: SynthesisViewProps) {
	const answers = useAnswersStore((state) => state.answers);
	// TODO: Implement layer visibility toggle once drawLayers state exists
	const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set());

	const handleToggleLayer = useCallback((questionId: string) => {
		setVisibleLayers((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(questionId)) {
				newSet.delete(questionId);
			} else {
				newSet.add(questionId);
			}
			return newSet;
		});
	}, []);

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex-1 overflow-y-auto p-6">
				<p className="mt-2 text-sm text-gray-600">
					Hier sehen Sie die Einstufung Ihrer Antworten nach Handlungsbedarfen.
					Grün weist auf keinen, Gelb auf mittleren und Rot auf hohen
					Handlungsbedarf hin. Klicken Sie auf eine Frage, um die Antworten
					direkt bearbeiten zu können
				</p>

				{steps.map((step) => {
					const sectionQuestions = step.questions || [];
					return (
						<div key={step.id} className="my-6">
							<div className="mb-3 flex items-center gap-2">
								{step.icon}
								<h3 className="text-primary text-lg font-medium">
									{step.title}
								</h3>
								<EyeSlashIcon className="ml-auto h-5 w-5 text-gray-400" />
							</div>
							<div className="flex flex-wrap gap-2">
								{sectionQuestions.map((questionId) => {
									const answer = answers[questionId];
									const isVisible = visibleLayers.has(questionId);
									return (
										<QuestionBadge
											key={questionId}
											questionId={questionId}
											answer={answer}
											onToggle={() => handleToggleLayer(questionId)}
											isVisible={isVisible}
										/>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>

			{/* Synthese Footer */}
			<div className="border-muted bg-secondary shrink-0 border-t p-4">
				<Button
					onClick={onBackToQuestions}
					className="text-md w-full text-white hover:text-white"
					size="lg"
					variant="ghost"
				>
					<XIcon className="h-4 w-4" />
					Zurück zu den Checkfragen
				</Button>
			</div>
		</div>
	);
}
