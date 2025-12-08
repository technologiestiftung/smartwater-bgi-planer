import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AnswersActions, AnswersState, AnswersStore } from "./types";

const initialState: AnswersState = {
	answers: {},
};

const createAnswersActions = (
	set: (fn: (state: AnswersStore) => AnswersStore) => void,
	get: () => AnswersStore,
): AnswersActions => ({
	setAnswer: (questionId: string, answer: boolean | null) => {
		set((state) => ({
			...state,
			answers: {
				...state.answers,
				[questionId]: answer,
			},
		}));
	},

	getAnswer: (questionId: string) => {
		return get().answers[questionId];
	},

	clearAnswers: () => {
		set((state) => ({
			...state,
			answers: {},
		}));
	},
});

export const useAnswersStore = create<AnswersStore>()(
	persist(
		(set, get) => ({
			...initialState,
			...createAnswersActions(set, get),
		}),
		{
			name: "answers-store",
			partialize: (state) => ({ answers: state.answers }),
		},
	),
);
