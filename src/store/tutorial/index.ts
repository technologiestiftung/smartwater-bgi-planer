import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { TutorialState, TutorialActions } from "./types";

const initialState: TutorialState = {
	showTutorialOnFirstQuestion: null,
	showTutorialOnFirstMeasureDraw: null,
};

export const useTutorialStore = create<TutorialState & TutorialActions>()(
	devtools(
		immer(
			persist(
				(set) => ({
					...initialState,
					setTutorialOnFirstQuestion: (showTutorialOnFirstQuestion) =>
						set({
							showTutorialOnFirstQuestion,
						}),
					setTutorialOnFirstMeasureDraw: (showTutorialOnFirstMeasureDraw) =>
						set({
							showTutorialOnFirstMeasureDraw,
						}),
				}),
				{
					name: "tutorial-storage",
				},
			),
		),
		{ name: "tutorialStore" },
	),
);
