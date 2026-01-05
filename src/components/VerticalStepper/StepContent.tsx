"use client";

import { useVerticalStepper } from "./VerticalStepperContext";

interface StepContentProps {
	stepId: string;
	children: React.ReactNode;
}

export function StepContent({ stepId, children }: StepContentProps) {
	const { currentStepId } = useVerticalStepper();

	if (currentStepId !== stepId) {
		return null;
	}

	return <div className="h-full w-full">{children}</div>;
}
