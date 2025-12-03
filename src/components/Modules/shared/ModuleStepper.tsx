import { useModuleNavigationGeneric } from "@/components/Modules/shared/useModuleNavigationGeneric";
import { SideMenu } from "@/components/SideMenu";
import type { StepConfig } from "@/components/VerticalStepper";
import {
	StepContainer,
	StepContent,
	StepIndicator,
	VerticalStepper,
	useVerticalStepper,
} from "@/components/VerticalStepper";
import type { SectionId } from "@/store/ui/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface ModuleStepperProps<TSectionId extends SectionId> {
	steps: StepConfig[];
	SectionContent: React.ComponentType<{ sectionId: TSectionId }>;
	StepperFooter: React.ComponentType<any>;
	SynthesisView: React.ComponentType<{ onBackToQuestions: () => void }>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	projectId: string;
	useLayersStore: any;
	useUiStore: any;
	LAYER_IDS: any;
	footerProps?: Record<string, any>;
	isStepValid?: (stepId: string) => boolean;
}

function ModuleStepperContent<TSectionId extends SectionId>({
	steps,
	SectionContent,
	StepperFooter,
	SynthesisView,
	onOpenChange,
	useLayersStore,
	useUiStore,
	footerProps = {},
	isStepValid,
}: Omit<
	ModuleStepperProps<TSectionId>,
	"open" | "title" | "description" | "projectId" | "LAYER_IDS"
>) {
	const { setStepValidation, currentStepId, goToStep } = useVerticalStepper();
	const moduleNavigation = useModuleNavigationGeneric({
		steps,
		useVerticalStepper,
		useUiStore,
		useLayersStore,
	});

	const { questionIndices, restoreModuleState, handleShowSynthesis } =
		moduleNavigation;

	const applyConfigLayers = useLayersStore(
		(state: any) => state.applyConfigLayers,
	);
	const resetDrawInteractions = useUiStore(
		(state: any) => state.resetDrawInteractions,
	);
	const setIsSynthesisMode = useUiStore(
		(state: any) => state.setIsSynthesisMode,
	);
	const isSynthesisMode = useUiStore((state: any) => state.isSynthesisMode);

	// Validation Effect
	useEffect(() => {
		if (isStepValid) {
			steps.forEach((step) => {
				setStepValidation(step.id, () => isStepValid(step.id));
			});
		}
	}, [steps, setStepValidation, isStepValid]);

	// Reset Draw Interactions Effect
	useEffect(() => {
		resetDrawInteractions();
	}, [questionIndices, resetDrawInteractions]);

	const onBackToQuestions = useCallback(() => {
		resetDrawInteractions();
		const savedState = restoreModuleState();
		if (savedState) {
			goToStep(savedState.sectionId);
			const currentSection = steps.find((s) => s.id === savedState.sectionId);
			const currentQuestionIndex =
				savedState.questionIndices[savedState.sectionId];
			const currentQuestionId =
				currentSection?.questions?.[currentQuestionIndex];
			if (currentQuestionId) {
				applyConfigLayers(currentQuestionId, true);
			}
		} else {
			goToStep(steps[0]?.id);
			const firstQuestionId = steps[0]?.questions?.[0];
			if (firstQuestionId) {
				applyConfigLayers(firstQuestionId, true);
			}
		}
		setIsSynthesisMode(false);
	}, [
		restoreModuleState,
		resetDrawInteractions,
		applyConfigLayers,
		setIsSynthesisMode,
		steps,
		goToStep,
	]);

	const canProceed =
		currentStepId && isStepValid ? isStepValid(currentStepId) : true;

	if (isSynthesisMode) {
		return <SynthesisView onBackToQuestions={onBackToQuestions} />;
	}

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex min-h-0 flex-1 pb-4">
				<StepIndicator className="w-20" />
				<StepContainer className="overflow-y-auto">
					{steps.map((step) => (
						<StepContent key={step.id} stepId={step.id}>
							<SectionContent sectionId={step.id as TSectionId} />
						</StepContent>
					))}
				</StepContainer>
			</div>
			<div className="shrink-0">
				<StepperFooter
					onClose={() => onOpenChange(false)}
					onShowSynthesis={handleShowSynthesis}
					useModuleNavigation={() => moduleNavigation}
					isNextDisabled={!canProceed}
					{...footerProps}
				/>
			</div>
		</div>
	);
}

export function ModuleStepper<TSectionId extends SectionId>({
	steps,
	SectionContent,
	StepperFooter,
	SynthesisView,
	open,
	onOpenChange,
	title,
	description,
	useLayersStore,
	useUiStore,
	footerProps = {},
	isStepValid,
}: ModuleStepperProps<TSectionId>) {
	const layerConfig = useLayersStore((state: any) => state.layerConfig);
	const applyConfigLayers = useLayersStore(
		(state: any) => state.applyConfigLayers,
	);
	const isMapReady = true; // Replace with useMapReady if needed
	const hasInitializedRef = useRef(false);
	const [initialStepId] = useState<string>(steps[0]?.id);

	useEffect(() => {
		if (
			open &&
			layerConfig.length > 0 &&
			isMapReady &&
			!hasInitializedRef.current
		) {
			const firstQuestionId = steps[0]?.questions?.[0];
			if (firstQuestionId) {
				applyConfigLayers(firstQuestionId, true);
				hasInitializedRef.current = true;
			}
		}
	}, [open, layerConfig.length, applyConfigLayers, isMapReady, steps]);

	useEffect(() => {
		if (!open) {
			hasInitializedRef.current = false;
		}
	}, [open]);

	return (
		<SideMenu
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			description={description}
			footer={null}
			bodyClassName="p-0"
			showStepper={true}
		>
			<VerticalStepper steps={steps} initialStepId={initialStepId}>
				<ModuleStepperContent
					steps={steps}
					SectionContent={SectionContent}
					StepperFooter={StepperFooter}
					SynthesisView={SynthesisView}
					onOpenChange={onOpenChange}
					useLayersStore={useLayersStore}
					useUiStore={useUiStore}
					footerProps={footerProps}
					isStepValid={isStepValid}
				/>
			</VerticalStepper>
		</SideMenu>
	);
}
