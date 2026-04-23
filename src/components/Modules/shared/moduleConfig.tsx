import { StepConfig } from "@/components/VerticalStepper";
import { getIconComponent } from "@/lib/helpers/iconMap";
import {
	ModuleConfig,
	ModuleMeasurementConfig,
	ModulesConfigFile,
} from "@/types/shared";
import modulesConfig from "../modules.json";

export type ModuleStepViewConfig = StepConfig & {
	measurements?: ModuleMeasurementConfig[];
};

export function getModuleConfig(moduleId: string): ModuleConfig | undefined {
	const config = modulesConfig as ModulesConfigFile;
	return config.modules.find((module) => module.id === moduleId);
}

export function getModuleSteps(moduleId: string): ModuleStepViewConfig[] {
	const moduleConfig = getModuleConfig(moduleId);
	if (!moduleConfig) {
		console.error(`Module with id "${moduleId}" not found in modules.json`);
		return [];
	}

	return moduleConfig.steps.map((step) => {
		const IconComponent = getIconComponent(step.icon);
		const measurementQuestionIds = (step.measurements ?? [])
			.map((measurement) => measurement.layerConfigId ?? measurement.id)
			.filter(Boolean);
		const questions = step.questions ?? measurementQuestionIds;

		return {
			id: step.id,
			icon: <IconComponent />,
			title: step.title,
			questions,
			measurements: step.measurements,
			displayInSynthesis: step.displayInSynthesis,
		};
	});
}

export function getModuleMetadata(moduleId: string) {
	const moduleConfig = getModuleConfig(moduleId);
	if (!moduleConfig) {
		return {
			title: "",
			description: "",
		};
	}

	return {
		title: moduleConfig.title,
		description: moduleConfig.description,
	};
}
