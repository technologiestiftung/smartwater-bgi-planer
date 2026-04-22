import { ScenarioState } from "./types";

type SetState = (fn: (state: ScenarioState) => Partial<ScenarioState>) => void;

const createScenarioId = () =>
	`scenario-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const createCreateScenario = (set: SetState) => {
	return (name: string) => {
		const id = createScenarioId();

		set((state) => ({
			scenarios: {
				...state.scenarios,
				[id]: {
					id,
					name,
					measures: [],
				},
			},
			activeScenarioId: state.activeScenarioId ?? id,
		}));
	};
};

export const createUpdateScenarioName = (set: SetState) => {
	return (id: string, name: string) => {
		set((state) => {
			const scenario = state.scenarios[id];
			if (!scenario) return state;

			return {
				scenarios: {
					...state.scenarios,
					[id]: {
						...scenario,
						name,
					},
				},
			};
		});
	};
};

export const createAddMeasure = (set: SetState) => {
	return (id: string, measure: any) => {
		set((state) => {
			const scenario = state.scenarios[id];
			if (!scenario) return state;

			return {
				scenarios: {
					...state.scenarios,
					[id]: {
						...scenario,
						measures: [...scenario.measures, measure],
					},
				},
			};
		});
	};
};

export const createSetActiveScenario = (set: SetState) => {
	return (id: string) => {
		set((state) => {
			if (!state.scenarios[id]) return state;

			return { activeScenarioId: id };
		});
	};
};
