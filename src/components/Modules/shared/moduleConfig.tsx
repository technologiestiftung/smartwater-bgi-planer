import { StepConfig } from "@/components/VerticalStepper";
import { getIconComponent } from "@/lib/helpers/iconMap";
import modulesConfig from "../modules.json";

interface ModuleStepConfig {
	id: string;
	icon: string;
	title: string;
	questions: string[];
	displayInSynthesis?: boolean;
}

interface ModuleConfig {
	id: string;
	order: number;
	title: string;
	description: string;
	steps: ModuleStepConfig[];
}

interface ModulesConfigFile {
	modules: ModuleConfig[];
}

export function getModuleConfig(moduleId: string): ModuleConfig | undefined {
	const config = modulesConfig as ModulesConfigFile;
	return config.modules.find((module) => module.id === moduleId);
}

export function getModuleSteps(moduleId: string): StepConfig[] {
	const moduleConfig = getModuleConfig(moduleId);
	if (!moduleConfig) {
		console.error(`Module with id "${moduleId}" not found in modules.json`);
		return [];
	}

	return moduleConfig.steps.map((step) => {
		const IconComponent = getIconComponent(step.icon);
		return {
			id: step.id,
			icon: <IconComponent />,
			title: step.title,
			questions: step.questions,
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
