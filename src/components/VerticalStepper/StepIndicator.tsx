"use client";

import { cn } from "@/lib/utils";
import { useVerticalStepper } from "./VerticalStepperContext";

interface StepIndicatorProps {
	className?: string;
}

export function StepIndicator({ className }: StepIndicatorProps) {
	const { steps, currentStepId, goToStep, currentStepIndex } =
		useVerticalStepper();

	return (
		<div className={cn("flex h-full flex-col items-center", className)}>
			{steps.map((step, index) => {
				const isActive = step.id === currentStepId;
				const isPast = index < currentStepIndex;
				const isLast = index === steps.length - 1;

				return (
					<div
						key={step.id}
						className={cn(
							"flex origin-top flex-col items-center transition-all duration-500",
							isActive ? "grow" : "grow-0",
						)}
					>
						<button
							onClick={() => goToStep(step.id)}
							className={cn(
								"flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 [&_svg]:size-6",
								isActive &&
									"border-primary bg-primary text-primary-foreground shadow-md",
								isPast &&
									!isActive &&
									"border-light bg-light text-primary [&_svg]:fill-primary",
								!isActive &&
									!isPast &&
									"border-neutral-mid-darker text-neutral-mid-darker fill-neutral-mid-darker [&_svg]:fill-neutral-mid-darker border-3",
							)}
						>
							<div
								className={cn(
									"flex h-6 w-6 items-center justify-center",
									isActive && "text-primary-foreground",
									!isActive && "text-muted-foreground",
								)}
							>
								{step.icon}
							</div>
						</button>

						{/* Connector Line */}
						{!isLast && (
							<div
								className={cn(
									"w-1",
									isPast ? "bg-light" : "bg-neutral-mid-darker",
									isActive ? "bg-primary grow" : "h-6",
								)}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
