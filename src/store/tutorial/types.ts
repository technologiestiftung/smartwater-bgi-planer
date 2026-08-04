export interface TutorialState {
	showTutorialOnFirstQuestion: boolean | null;
	showTutorialOnFirstMeasureDraw: boolean | null;
}

export interface TutorialActions {
	setTutorialOnFirstQuestion: (showTutorialOnFirstQuestion: boolean) => void;
	setTutorialOnFirstMeasureDraw: (
		showTutorialOnFirstMeasureDraw: boolean,
	) => void;
}
