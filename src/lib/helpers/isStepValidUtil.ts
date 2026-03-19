"use client";

import { useLayerFeatures } from "@/hooks/useLayerFeatures";
import { SectionId } from "@/lib/helpers/sectionIds";
import { useUiStore } from "@/store/ui";
import { useCallback } from "react";

export function useStepValid({
	stepName,
	starterQuestionId,
	layerId,
	steps,
}: {
	stepName: SectionId;
	starterQuestionId: string;
	layerId: string;
	steps: Array<{ id: string; questions?: string[] }>;
}) {
	const { hasFeatures } = useLayerFeatures(layerId);
	const questionIndices = useUiStore((state) => state.moduleQuestionIndices);

	return useCallback(
		(stepId: string) => {
			if (stepId === stepName) {
				const currentQuestionIndex = questionIndices[stepName];
				const stepQuestions = steps.find((s) => s.id === stepName)?.questions;
				const currentQuestionId = stepQuestions?.[currentQuestionIndex];
				const isStarterQuestion = currentQuestionId === starterQuestionId;
				return !isStarterQuestion || hasFeatures;
			}
			return true;
		},
		[hasFeatures, questionIndices, stepName, starterQuestionId, steps],
	);
}
