"use client";

import { createContext, useContext, useState, useCallback } from "react";

export interface StepConfig {
	id: string;
	icon: React.ReactNode;
	title: string;
	description?: string;
}

interface VerticalStepperContextValue {
	currentStepId: string;
	steps: StepConfig[];
	goToStep: (stepId: string) => void;
	nextStep: () => void;
	previousStep: () => void;
	canGoNext: boolean;
	canGoPrevious: boolean;
	currentStepIndex: number;
	totalSteps: number;
}

const VerticalStepperContext = createContext<
	VerticalStepperContextValue | undefined
>(undefined);

interface VerticalStepperProviderProps {
	steps: StepConfig[];
	initialStepId?: string;
	children: React.ReactNode;
}

export function VerticalStepperProvider({
	steps,
	initialStepId,
	children,
}: VerticalStepperProviderProps) {
	const [currentStepId, setCurrentStepId] = useState(
		initialStepId || steps[0]?.id,
	);

	const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

	const goToStep = useCallback((stepId: string) => {
		setCurrentStepId(stepId);
	}, []);

	const nextStep = useCallback(() => {
		const currentIndex = steps.findIndex((step) => step.id === currentStepId);
		if (currentIndex < steps.length - 1) {
			setCurrentStepId(steps[currentIndex + 1].id);
		}
	}, [steps, currentStepId]);

	const previousStep = useCallback(() => {
		const currentIndex = steps.findIndex((step) => step.id === currentStepId);
		if (currentIndex > 0) {
			setCurrentStepId(steps[currentIndex - 1].id);
		}
	}, [steps, currentStepId]);

	const canGoNext = currentStepIndex < steps.length - 1;
	const canGoPrevious = currentStepIndex > 0;

	return (
		<VerticalStepperContext.Provider
			value={{
				currentStepId,
				steps,
				goToStep,
				nextStep,
				previousStep,
				canGoNext,
				canGoPrevious,
				currentStepIndex,
				totalSteps: steps.length,
			}}
		>
			{children}
		</VerticalStepperContext.Provider>
	);
}

export function useVerticalStepper() {
	const context = useContext(VerticalStepperContext);
	if (!context) {
		throw new Error(
			"useVerticalStepper must be used within VerticalStepperProvider",
		);
	}
	return context;
}
