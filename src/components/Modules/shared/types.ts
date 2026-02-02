export interface ModuleStepConfig {
	id: string;
	icon: string;
	title: string;
	questions: string[];
	displayInSynthesis?: boolean;
}

export interface ModuleConfig {
	id: string;
	order: number;
	title: string;
	description: string;
	steps: ModuleStepConfig[];
}

export interface ModulesConfigFile {
	modules: ModuleConfig[];
}

export interface ModuleFooterProps {
	onClose: () => void;
	onShowSynthesis: () => void;
	useModuleNavigation: () => {
		getCurrentQuestionInfo: () => {
			isFirstQuestion: boolean;
			isLastQuestion: boolean;
		};
		navigateToPrevious: () => boolean;
		navigateToNext: () => boolean;
	};
	isNextDisabled?: boolean;
}
