import {
	ConnectedArea,
	MeasureValue,
	PlacedMeasure,
	ScenarioState,
} from "./types";

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
					BTFMeasures: [],
					connectedAreas: [],
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
	return (id: string, measure: PlacedMeasure) => {
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

export const createRemoveMeasure = (set: SetState) => {
	return (scenarioId: string, measureId: string) => {
		set((state) => {
			const scenario = state.scenarios[scenarioId];
			if (!scenario) return state;

			return {
				scenarios: {
					...state.scenarios,
					[scenarioId]: {
						...scenario,
						measures: scenario.measures.filter(
							(measure) => measure.id !== measureId,
						),
					},
				},
			};
		});
	};
};

export const createUpdateMeasureValues = (set: SetState) => {
	return (
		scenarioId: string,
		measureId: string,
		values: Record<string, MeasureValue>,
	) => {
		set((state) => {
			const scenario = state.scenarios[scenarioId];
			if (!scenario) return state;

			return {
				scenarios: {
					...state.scenarios,
					[scenarioId]: {
						...scenario,
						measures: scenario.measures.map((measure) =>
							measure.id === measureId
								? {
										...measure,
										values: {
											...measure.values,
											...values,
										},
									}
								: measure,
						),
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

export const createAddConnectedArea = (set: SetState) => {
	return (scenarioId: string, connectedArea: ConnectedArea) => {
		set((state) => {
			const scenario = state.scenarios[scenarioId];
			if (!scenario) return state;

			return {
				scenarios: {
					...state.scenarios,
					[scenarioId]: {
						...scenario,
						connectedAreas: [...scenario.connectedAreas, connectedArea],
					},
				},
			};
		});
	};
};

export const createRemoveConnectedArea = (set: SetState) => {
	return (scenarioId: string, connectedAreaId: string) => {
		set((state) => {
			const scenario = state.scenarios[scenarioId];
			if (!scenario) return state;

			return {
				scenarios: {
					...state.scenarios,
					[scenarioId]: {
						...scenario,
						connectedAreas: scenario.connectedAreas.filter(
							(ca) => ca.id !== connectedAreaId,
						),
					},
				},
			};
		});
	};
};
