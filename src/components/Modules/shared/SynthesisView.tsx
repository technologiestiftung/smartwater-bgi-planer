/* eslint-disable no-nested-ternary */
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
	onBackToQuestions: () => void;
	layerOverrides?: Record<string, string>;
}

export function SynthesisView({
	moduleId,
	synthesisViewId,
	description,
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

	// Hilfsfunktion zur Ermittlung der korrekten Layer-ID und Sichtbarkeit
	const getLayerData = useCallback(
		(drawLayerId: string | undefined) => {
			if (!drawLayerId) return { id: null, isVisible: false };
			const effectiveId =
				layerOverrides[drawLayerId] && layers.has(layerOverrides[drawLayerId])
					? layerOverrides[drawLayerId]
					: drawLayerId;
			return {
				id: effectiveId,
				isVisible: layers.get(effectiveId)?.visibility ?? false,
			};
		},
		[layers, layerOverrides],
	);

	useEffect(() => {
		if (!isMapReady || hasInitialized.current) return;
		hasInitialized.current = true;

		applyConfigLayers(synthesisViewId, true);

		if (moduleSavedState?.sectionId) {
			const step = moduleSteps.find((s) => s.id === moduleSavedState.sectionId);
			step?.questions?.forEach((qId) => {
				if (checkForQuestion(qId, true)) return;
				const config = layerConfig.find((c) => c.id === qId);
				const { id } = getLayerData(config?.drawLayerId);
				if (id) setLayerVisibility(id, true);
			});
		}
	}, [
		isMapReady,
		applyConfigLayers,
		synthesisViewId,
		moduleSteps,
		moduleSavedState,
		layerConfig,
		setLayerVisibility,
		getLayerData,
	]);

	const handleToggleLayer = (questionId: string) => {
		const config = layerConfig.find((c) => c.id === questionId);
		const { id, isVisible } = getLayerData(config?.drawLayerId);
		if (id) setLayerVisibility(id, !isVisible);
	};

	const handleToggleStepLayers = (stepQuestions: string[]) => {
		const relevantLayers = stepQuestions
			.map((qId) =>
				getLayerData(layerConfig.find((c) => c.id === qId)?.drawLayerId),
			)
			.filter((item) => item.id !== null);

		const anyVisible = relevantLayers.some((l) => l.isVisible);
		relevantLayers.forEach((l) => setLayerVisibility(l.id!, !anyVisible));
	};

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex-1 overflow-y-auto px-6 pb-6">
				<p className="mt-2 text-sm text-gray-600">{description}</p>
				{moduleSteps.map((step) => {
					const sectionQuestions = step.questions || [];
					const anyLayerVisible = sectionQuestions.some(
						(qId) =>
							getLayerData(layerConfig.find((c) => c.id === qId)?.drawLayerId)
								.isVisible,
					);

					const sectionAnswers = sectionQuestions
						.filter((q) => checkForQuestion(q))
						.map((q) => answers[q]);
					const allTrue =
						sectionAnswers.length > 0 &&
						sectionAnswers.every((a) => a === true);
					const allFalse =
						sectionAnswers.length > 0 &&
						sectionAnswers.every((a) => a === false);

					const iconColor =
						moduleId === "needForAction"
							? allTrue
								? "bg-red text-white"
								: allFalse
									? "bg-green"
									: "bg-yellow"
							: allTrue
								? "bg-green text-white"
								: allFalse
									? "bg-red"
									: "bg-yellow";

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
										<EyeIcon size={20} />
									) : (
										<EyeSlashIcon size={20} />
									)}
								</button>
							</div>
							<div className="flex flex-wrap gap-2">
								{sectionQuestions.map((qId) => {
									if (checkForQuestion(qId, true)) return null;
									const { isVisible } = getLayerData(
										layerConfig.find((c) => c.id === qId)?.drawLayerId,
									);
									return (
										<SynthesisBadge
											key={qId}
											questionId={qId}
											answer={answers[qId]}
											onToggle={() => handleToggleLayer(qId)}
											isVisible={isVisible}
										/>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
			<div className="border-muted bg-secondary shrink-0 border-t p-4">
				<Button
					onClick={onBackToQuestions}
					className="text-md w-full text-white hover:text-white"
					size="lg"
					variant="ghost"
				>
					<XIcon className="h-4 w-4" /> Zurück zu den Checkfragen
				</Button>
			</div>
		</div>
	);
}
