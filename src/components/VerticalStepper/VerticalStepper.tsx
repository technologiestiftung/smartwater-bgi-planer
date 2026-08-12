"use client";

import { cn } from "@/lib/utils";
import { VerticalStepperProvider, StepConfig } from "./VerticalStepperContext";

interface VerticalStepperProps {
	steps: StepConfig[];
	initialStepId?: string;
	children: React.ReactNode;
	className?: string;
}

export function VerticalStepper({
	steps,
	initialStepId,
	children,
	className,
}: VerticalStepperProps) {
	return (
		<VerticalStepperProvider steps={steps} initialStepId={initialStepId}>
			<div className={cn("flex h-full w-full", className)}>{children}</div>
		</VerticalStepperProvider>
	);
}
