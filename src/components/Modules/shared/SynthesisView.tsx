/* eslint-disable no-nested-ternary */
"use client";

import { SynthesisBadge } from "@/components/Modules/shared/SynthesisBadge";
import { getModuleSteps } from "@/components/Modules/shared/moduleConfig";
import { Button } from "@/components/ui/button";
import { useProjectsStore } from "@/store";
import { useMapReady } from "@/hooks/useMapReady";
import { checkForQuestion } from "@/lib/helpers/questionCheck";
import { useAnswersStore } from "@/store/answers";
import { useLayersStore } from "@/store/layers";
import { useUiStore } from "@/store/ui";
import {
	EyeIcon,
	EyeSlashIcon,
	XIcon,
	ShovelIcon,
	PencilRulerIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

interface SynthesisViewProps {
	moduleId: "needForAction" | "feasibility";
	synthesisViewId: string;
	description: string;
	onBackToQuestions: () => void;
	layerOverrides?: Record<string, string>;
	onBackToSpecificQuestion: (questionId: string, sectionId: string) => void;
}

export function SynthesisView({
	moduleId,
	synthesisViewId,
	description,
	onBackToQuestions,
	onBackToSpecificQuestion,
	layerOverrides = {},
}: SynthesisViewProps) {
	const answers = useAnswersStore((state) => state.answers);
	const moduleSavedState = useUiStore((state) => state.moduleSavedState);
	const isMapReady = useMapReady();
	const moduleSteps = getModuleSteps(moduleId);
	const hasInitialized = useRef(false);
	const router = useRouter();
	const { getProject } = useProjectsStore();
	const project = getProject();
	const projectId = project?.id || "";
	const { layerConfig, layers, setLayerVisibility, applyConfigLayers } =
		useLayersStore(
			useShallow((state) => ({
				layerConfig: state.layerConfig,
				layers: state.layers,
				setLayerVisibility: state.setLayerVisibility,
				applyConfigLayers: state.applyConfigLayers,
			})),
		);

	const visibleModuleStep = useMemo(
		() => moduleSteps.filter((step) => step.displayInSynthesis !== false),
		[moduleSteps],
	);

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

				if (id && answers[qId] === true) {
					setLayerVisibility(id, true);
				}
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
		answers,
	]);

	const handleToggleLayer = (qId: string) => {
		if (answers[qId] !== true) return;
		const config = layerConfig.find((c) => c.id === qId);
		const { id, isVisible } = getLayerData(config?.drawLayerId);
		if (id) setLayerVisibility(id, !isVisible);
	};

	const handleToggleStepLayers = (stepQuestions: string[]) => {
		const relevantLayers = stepQuestions
			.filter((qId) => answers[qId] === true)
			.map((qId) =>
				getLayerData(layerConfig.find((c) => c.id === qId)?.drawLayerId),
			)
			.filter((item) => item.id !== null);

		const anyVisible = relevantLayers.some((l) => l.isVisible);
		relevantLayers.forEach((l) => setLayerVisibility(l.id!, !anyVisible));
	};

	const onNextModule = () => router.push(`/${projectId}/machbarkeit`);

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex-1 overflow-y-auto px-6 pb-6">
				<p className="text-primary mt-2">{description}</p>
				{visibleModuleStep.map((step) => {
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
					const anyAnswered = sectionAnswers.some((a) => a !== undefined);

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
								<div
									className={`${anyAnswered ? iconColor : "bg-neutral-light"} rounded-full p-1`}
								>
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
											onBackToSpecificQuestion={onBackToSpecificQuestion}
										/>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
			<div className="border-muted bg-secondary flex shrink-0 border-t px-4">
				<Button
					onClick={onBackToQuestions}
					className="text-md my-4 flex-1 text-white hover:text-white"
					size="lg"
					variant="ghost"
				>
					<XIcon className="h-4 w-4" />
					zu den Checkfragen
				</Button>
				<div className="w-[1px] self-stretch bg-white" />
				<Button
					onClick={onNextModule}
					className="text-md my-4 flex-1 text-white hover:text-white"
					size="lg"
					variant="ghost"
					disabled={moduleId === "feasibility"}
				>
					{moduleId === "needForAction" ? (
						<ShovelIcon className="h-4 w-4" />
					) : (
						<PencilRulerIcon className="h-4 w-4" />
					)}
					zu Modul {moduleId === "needForAction" ? "2" : "3"}
				</Button>
			</div>
		</div>
	);
}
