"use client";

import { useUiStore } from "@/store/ui";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

export interface StepConfig {
	id: string;
	icon: React.ReactNode;
	title: string;
	description?: string;
	questions?: string[];
	canProceed?: () => boolean;
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
	setStepValidation: (stepId: string, canProceed: () => boolean) => void;
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
	const [stepValidations, setStepValidations] = useState<
		Map<string, () => boolean>
	>(new Map());
	const setCurrentStepIdInStore = useUiStore((state) => state.setCurrentStepId);

	const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);
	const currentStep = steps[currentStepIndex];

	useEffect(() => {
		setCurrentStepIdInStore(currentStepId);

		return () => {
			setCurrentStepIdInStore(null);
		};
	}, [currentStepId, setCurrentStepIdInStore]);

	const setStepValidation = useCallback(
		(stepId: string, canProceed: () => boolean) => {
			setStepValidations((prev) => {
				const next = new Map(prev);
				next.set(stepId, canProceed);
				return next;
			});
		},
		[],
	);

	const canCurrentStepProceed = useCallback(() => {
		const validationFn = stepValidations.get(currentStepId);
		if (validationFn) {
			return validationFn();
		}
		if (currentStep?.canProceed) {
			return currentStep.canProceed();
		}
		return true;
	}, [currentStepId, currentStep, stepValidations]);

	const goToStep = useCallback(
		(stepId: string) => {
			if (stepId !== currentStepId && !canCurrentStepProceed()) {
				return;
			}
			setCurrentStepId(stepId);
		},
		[currentStepId, canCurrentStepProceed],
	);

	const nextStep = useCallback(() => {
		const currentIndex = steps.findIndex((step) => step.id === currentStepId);
		if (currentIndex < steps.length - 1 && canCurrentStepProceed()) {
			setCurrentStepId(steps[currentIndex + 1].id);
		}
	}, [steps, currentStepId, canCurrentStepProceed]);

	const previousStep = useCallback(() => {
		const currentIndex = steps.findIndex((step) => step.id === currentStepId);
		if (currentIndex > 0) {
			setCurrentStepId(steps[currentIndex - 1].id);
		}
	}, [steps, currentStepId]);

	const canGoNext =
		currentStepIndex < steps.length - 1 && canCurrentStepProceed();
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
				setStepValidation,
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
