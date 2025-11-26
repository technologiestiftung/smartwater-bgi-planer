import { QuestionBadge } from "@/components/Modules/HandlungsbedarfeModule/QuestionBadge";
import { steps } from "@/components/Modules/HandlungsbedarfeModule/constants";
import { Button } from "@/components/ui/button";
import { useMapReady } from "@/hooks/use-map-ready";
import { useAnswersStore } from "@/store/answers";
import { useLayersStore } from "@/store/layers";
import { EyeIcon, EyeSlashIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect } from "react";

interface SynthesisViewProps {
	onBackToQuestions: () => void;
}

export function SynthesisView({ onBackToQuestions }: SynthesisViewProps) {
	const answers = useAnswersStore((state) => state.answers);
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const layers = useLayersStore((state) => state.layers);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);
	const isMapReady = useMapReady();

	useEffect(() => {
		if (!isMapReady) return;

		applyConfigLayers("synthesis_view", false);
	}, [applyConfigLayers, isMapReady]);

	const handleToggleLayer = useCallback(
		(questionId: string) => {
			const questionConfig = layerConfig.find(
				(config) => config.id === questionId,
			);
			if (!questionConfig?.drawLayerId) return;

			const layer = layers.get(questionConfig.drawLayerId);
			const isCurrentlyVisible = layer?.visibility ?? false;

			setLayerVisibility(questionConfig.drawLayerId, !isCurrentlyVisible);
		},
		[layerConfig, layers, setLayerVisibility],
	);

	const handleToggleStepLayers = useCallback(
		(stepQuestions: string[]) => {
			// Get all layers for this step
			const stepLayers = stepQuestions
				.map((questionId) => {
					const questionConfig = layerConfig.find(
						(config) => config.id === questionId,
					);
					return questionConfig?.drawLayerId
						? {
								drawLayerId: questionConfig.drawLayerId,
								layer: layers.get(questionConfig.drawLayerId),
							}
						: null;
				})
				.filter(
					(
						item,
					): item is {
						drawLayerId: string;
						layer: NonNullable<ReturnType<typeof layers.get>>;
					} => item !== null && item.layer !== undefined,
				);

			const anyVisible = stepLayers.some((item) => item.layer.visibility);

			stepLayers.forEach((item) => {
				setLayerVisibility(item.drawLayerId, !anyVisible);
			});
		},
		[layerConfig, layers, setLayerVisibility],
	);

	useEffect(() => {
		console.log("[SynthesisView] answers::", answers);
	}, [answers]);

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
					const anyLayerVisible = sectionQuestions.some((questionId) => {
						const questionConfig = layerConfig.find(
							(config) => config.id === questionId,
						);
						const layer = questionConfig?.drawLayerId
							? layers.get(questionConfig.drawLayerId)
							: null;
						return layer?.visibility ?? false;
					});

					return (
						<div key={step.id} className="my-6">
							<div className="mb-3 flex items-center gap-2">
								<div className="bg-red rounded-full p-1 text-white">
									{step.icon}
								</div>
								<h3 className="text-primary text-lg font-medium">
									{step.title}
								</h3>
								<button
									onClick={() => handleToggleStepLayers(sectionQuestions)}
									className="transition-opacity hover:opacity-70"
									aria-label={
										anyLayerVisible
											? "Alle Layer ausblenden"
											: "Alle Layer einblenden"
									}
								>
									{anyLayerVisible ? (
										<EyeIcon className="h-5 w-5" />
									) : (
										<EyeSlashIcon className="h-5 w-5" />
									)}
								</button>
							</div>
							<div className="flex flex-wrap gap-2">
								{sectionQuestions.map((questionId) => {
									const answer = answers[questionId];
									const questionConfig = layerConfig.find(
										(config) => config.id === questionId,
									);
									const layer = questionConfig?.drawLayerId
										? layers.get(questionConfig.drawLayerId)
										: null;
									const isVisible = layer?.visibility ?? false;
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
