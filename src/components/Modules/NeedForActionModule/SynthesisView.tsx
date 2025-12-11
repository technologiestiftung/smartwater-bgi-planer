import { SynthesisBadge } from "@/components/Modules/NeedForActionModule/SynthesisBadge";
import { needForActionSteps } from "@/components/Modules/NeedForActionModule/constants";
import { Button } from "@/components/ui/button";
import { useMapReady } from "@/hooks/use-map-ready";
import { useAnswersStore } from "@/store/answers";
import { useLayersStore } from "@/store/layers";
import { useUiStore } from "@/store/ui";
import { EyeIcon, EyeSlashIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

interface SynthesisViewProps {
	onBackToQuestions: () => void;
}

export function SynthesisView({ onBackToQuestions }: SynthesisViewProps) {
	const answers = useAnswersStore((state) => state.answers);

	const { layerConfig, layers, setLayerVisibility, applyConfigLayers } =
		useLayersStore(
			useShallow((state) => ({
				layerConfig: state.layerConfig,
				layers: state.layers,
				setLayerVisibility: state.setLayerVisibility,
				applyConfigLayers: state.applyConfigLayers,
			})),
		);

	const moduleSavedState = useUiStore((state) => state.moduleSavedState);
	const isMapReady = useMapReady();

	useEffect(() => {
		if (!isMapReady) return;

		applyConfigLayers("synthesis_view", true);

		if (moduleSavedState) {
			const lastActiveStep = needForActionSteps.find(
				(step) => step.id === moduleSavedState.sectionId,
			);
			const stepQuestions = lastActiveStep?.questions || [];

			stepQuestions.forEach((questionId) => {
				if (
					questionId.includes("starter_question") ||
					questionId.includes("module_introduction")
				)
					return;
				const questionConfig = layerConfig.find(
					(config) => config.id === questionId,
				);
				if (questionConfig?.drawLayerId) {
					setLayerVisibility(questionConfig.drawLayerId, true);
				}
			});
		}
	}, [
		applyConfigLayers,
		isMapReady,
		moduleSavedState,
		layerConfig,
		setLayerVisibility,
	]);

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

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex-1 overflow-y-auto p-6">
				<p className="mt-2 text-sm text-gray-600">
					Hier sehen Sie die Einstufung Ihrer Antworten nach Handlungsbedarfen.
					Grün weist auf keinen, Gelb auf mittleren und Rot auf hohen
					Handlungsbedarf hin. Klicken Sie auf eine Frage, um die Antworten
					direkt bearbeiten zu können
				</p>

				{needForActionSteps.map((step) => {
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

					const sectionAnswers = sectionQuestions
						.filter(
							(q) =>
								!q.includes("starter_question") &&
								!q.includes("module_introduction"),
						)
						.map((questionId) => answers[questionId]);

					const allTrue =
						sectionAnswers.length > 0 &&
						sectionAnswers.every((a) => a === true);
					const allFalse =
						sectionAnswers.length > 0 &&
						sectionAnswers.every((a) => a === false);

					let iconColor = "bg-yellow";
					if (allTrue) {
						iconColor = "bg-red text-white";
					} else if (allFalse) {
						iconColor = "bg-green";
					}

					return (
						<div key={step.id} className="my-6">
							<div className="mb-3 flex items-center gap-2">
								<div className={`${iconColor} rounded-full p-1`}>
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
									if (
										questionId.includes("starter_question") ||
										questionId.includes("module_introduction")
									)
										return null;
									const answer = answers[questionId];
									const questionConfig = layerConfig.find(
										(config) => config.id === questionId,
									);
									const layer = questionConfig?.drawLayerId
										? layers.get(questionConfig.drawLayerId)
										: null;
									const isVisible = layer?.visibility ?? false;
									return (
										<SynthesisBadge
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
