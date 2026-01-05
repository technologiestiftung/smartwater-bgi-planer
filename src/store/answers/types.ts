export type Answer = boolean | null;

export interface AnswersState {
	answers: Record<string, Answer>;
}

export interface AnswersActions {
	setAnswer: (questionId: string, answer: Answer) => void;
	getAnswer: (questionId: string) => Answer | undefined;
	clearAnswers: () => void;
}

export type AnswersStore = AnswersState & AnswersActions;
