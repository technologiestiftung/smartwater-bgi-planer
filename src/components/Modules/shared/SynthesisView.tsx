"use client";

import { SynthesisBadge } from "@/components/Modules/shared/SynthesisBadge";
import { getModuleSteps } from "@/components/Modules/shared/moduleConfig";
import { Button } from "@/components/ui/button";
import { useMapReady } from "@/hooks/use-map-ready";
import { checkForQuestion } from "@/lib/helpers/questions";
import { useAnswersStore } from "@/store/answers";
import { useLayersStore } from "@/store/layers";
import { useUiStore } from "@/store/ui";
import { EyeIcon, EyeSlashIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

interface SynthesisViewProps {
	moduleId: "needForAction" | "feasibility";
	synthesisViewId: string;
	description: string;
	colorLogic: "handlungsbedarf" | "machbarkeit";
	onBackToQuestions: () => void;
	layerOverrides?: Record<string, string>;
}

export function SynthesisView({
	moduleId,
	synthesisViewId,
	description,
	colorLogic,
	onBackToQuestions,
	layerOverrides = {},
}: SynthesisViewProps) {
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
	const moduleSteps = getModuleSteps(moduleId);

	const hasInitialized = useRef(false);
	const lastSectionId = useRef<string | null>(null);

	useEffect(() => {
		const currentSectionId = moduleSavedState?.sectionId ?? null;

		if (lastSectionId.current !== currentSectionId) {
			hasInitialized.current = false;
			lastSectionId.current = currentSectionId;
		}

		if (!isMapReady || hasInitialized.current) return;

		hasInitialized.current = true;

		applyConfigLayers(synthesisViewId, true);

		if (moduleSavedState) {
			const lastActiveStep = moduleSteps.find(
				(step) => step.id === moduleSavedState.sectionId,
			);
			const stepQuestions = lastActiveStep?.questions || [];

			stepQuestions.forEach((questionId) => {
				if (checkForQuestion(questionId, true)) return;
				const questionConfig = layerConfig.find(
					(config) => config.id === questionId,
				);
				if (questionConfig?.drawLayerId) {
					setLayerVisibility(questionConfig.drawLayerId, true);
				}
			});
		}
	}, [
		isMapReady,
		moduleSavedState,
		applyConfigLayers,
		synthesisViewId,
		moduleSteps,
		layerConfig,
		setLayerVisibility,
	]);

	const handleToggleLayer = useCallback(
		(questionId: string) => {
			const questionConfig = layerConfig.find(
				(config) => config.id === questionId,
			);
			if (!questionConfig?.drawLayerId) return;

			// Verwende explizit angegebenen Override, falls vorhanden
			const overrideLayerId = layerOverrides[questionConfig.drawLayerId];
			const layerIdToToggle =
				overrideLayerId && layers.get(overrideLayerId)
					? overrideLayerId
					: questionConfig.drawLayerId;

			const layer = layers.get(layerIdToToggle);
			const isCurrentlyVisible = layer?.visibility ?? false;

			setLayerVisibility(layerIdToToggle, !isCurrentlyVisible);
		},
		[layerConfig, layers, setLayerVisibility, layerOverrides],
	);

	const handleToggleStepLayers = useCallback(
		(stepQuestions: string[]) => {
			const stepLayers = stepQuestions
				.map((questionId) => {
					const questionConfig = layerConfig.find(
						(config) => config.id === questionId,
					);
					if (!questionConfig?.drawLayerId) return null;

					const overrideLayerId = layerOverrides[questionConfig.drawLayerId];
					const layerIdToUse =
						overrideLayerId && layers.get(overrideLayerId)
							? overrideLayerId
							: questionConfig.drawLayerId;

					return {
						drawLayerId: layerIdToUse,
						layer: layers.get(layerIdToUse),
					};
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
		[layerConfig, layers, setLayerVisibility, layerOverrides],
	);

	const getIconColor = (allTrue: boolean, allFalse: boolean) => {
		if (colorLogic === "handlungsbedarf") {
			// NeedForAction: true = hoher Handlungsbedarf (rot), false = kein Handlungsbedarf (grün)
			if (allTrue) return "bg-red text-white";
			if (allFalse) return "bg-green";
		} else {
			// Feasibility: true = gute Machbarkeit (grün), false = geringe Machbarkeit (rot)
			if (allTrue) return "bg-green text-white";
			if (allFalse) return "bg-red";
		}
		return "bg-yellow";
	};

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex-1 overflow-y-auto px-6 pb-6">
				<p className="mt-2 text-sm text-gray-600">{description}</p>

				{moduleSteps.map((step) => {
					const sectionQuestions = step.questions || [];
					const anyLayerVisible = sectionQuestions.some((questionId) => {
						const questionConfig = layerConfig.find(
							(config) => config.id === questionId,
						);
						if (!questionConfig?.drawLayerId) return false;

						const overrideLayerId = layerOverrides[questionConfig.drawLayerId];
						const layerToCheck =
							(overrideLayerId && layers.get(overrideLayerId)) ||
							layers.get(questionConfig.drawLayerId);

						return layerToCheck?.visibility ?? false;
					});

					const sectionAnswers = sectionQuestions
						.filter((q) => checkForQuestion(q))
						.map((questionId) => answers[questionId]);

					const allTrue =
						sectionAnswers.length > 0 &&
						sectionAnswers.every((a) => a === true);

					const allFalse =
						sectionAnswers.length > 0 &&
						sectionAnswers.every((a) => a === false);

					const iconColor = getIconColor(allTrue, allFalse);

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
									if (checkForQuestion(questionId, true)) return null;
									const answer = answers[questionId];
									const questionConfig = layerConfig.find(
										(config) => config.id === questionId,
									);

									let isVisible = false;
									if (questionConfig?.drawLayerId) {
										const overrideLayerId =
											layerOverrides[questionConfig.drawLayerId];
										const layerToCheck =
											(overrideLayerId && layers.get(overrideLayerId)) ||
											layers.get(questionConfig.drawLayerId);
										isVisible = layerToCheck?.visibility ?? false;
									}

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
