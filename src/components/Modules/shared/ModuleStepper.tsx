import { useModuleNavigation } from "@/components/Modules/shared/useModuleNavigation";
import { SideMenu } from "@/components/SideMenu";
import type { StepConfig } from "@/components/VerticalStepper";
import {
	StepContainer,
	StepContent,
	StepIndicator,
	VerticalStepper,
	useVerticalStepper,
} from "@/components/VerticalStepper";
import { useMapReady } from "@/hooks/use-map-ready";
import { useLayersStore, useUiStore } from "@/store";
import type { SectionId } from "@/types/sectionIds";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

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
	footerProps?: Record<string, any>;
	isStepValid?: (stepId: string) => boolean;
}

function ModuleStepperContent<TSectionId extends SectionId>({
	steps,
	SectionContent,
	StepperFooter,
	SynthesisView,
	onOpenChange,
	footerProps = {},
	isStepValid,
}: Omit<
	ModuleStepperProps<TSectionId>,
	"open" | "title" | "description" | "projectId"
>) {
	const { setStepValidation, currentStepId, goToStep } = useVerticalStepper();
	const moduleNavigation = useModuleNavigation({
		steps,
		useVerticalStepper,
	});

	const { questionIndices, restoreModuleState, handleShowSynthesis } =
		moduleNavigation;

	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);

	const {
		resetDrawInteractions,
		setIsSynthesisMode,
		isSynthesisMode,
		setShowStepper,
	} = useUiStore(
		useShallow((state) => ({
			resetDrawInteractions: state.resetDrawInteractions,
			setIsSynthesisMode: state.setIsSynthesisMode,
			isSynthesisMode: state.isSynthesisMode,
			setShowStepper: state.setShowStepper,
		})),
	);

	useEffect(() => {
		if (isStepValid) {
			steps.forEach((step) => {
				setStepValidation(step.id, () => isStepValid(step.id));
			});
		}
	}, [steps, setStepValidation, isStepValid]);

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
		setShowStepper(true);
	}, [
		restoreModuleState,
		resetDrawInteractions,
		applyConfigLayers,
		setIsSynthesisMode,
		setShowStepper,
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
	footerProps = {},
	isStepValid,
}: ModuleStepperProps<TSectionId>) {
	const { layerConfig, applyConfigLayers } = useLayersStore(
		useShallow((state) => ({
			layerConfig: state.layerConfig,
			applyConfigLayers: state.applyConfigLayers,
		})),
	);
	const isMapReady = useMapReady();
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
					footerProps={footerProps}
					isStepValid={isStepValid}
				/>
			</VerticalStepper>
		</SideMenu>
	);
}
