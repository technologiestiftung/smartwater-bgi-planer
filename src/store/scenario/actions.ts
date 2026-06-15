import areaCalculations from "@/lib/simulation/calculations/areaCalculations";
import { simulationEngine } from "@/lib/simulation/simulationEngine";
import { useProjectStore } from "@/store/project";
import { ComputedFeatures } from "@/store/project/types";
import { ConnectedArea, Measure, MeasureValue, ScenarioState } from "./types";

type SetState = (fn: (state: ScenarioState) => Partial<ScenarioState>) => void;

const createScenarioId = () =>
	`scenario-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const syncProjectDerivedSimulation = (measures: Measure[]) => {
	const { inputFeatures, activeAreaId, preprocessedStats } =
		useProjectStore.getState();
	const stats =
		preprocessedStats ?? simulationEngine.preprocessInput(inputFeatures);

	if (!preprocessedStats) {
		useProjectStore.setState({ preprocessedStats: stats });
	}

	const computedFeatures: ComputedFeatures[] = stats.features.map((item) => {
		const result = simulationEngine.applyMeasures(
			item.computedArea,
			measures.filter((measure) => measure.code === item.code),
		);

		return {
			code: item.code,
			computedArea: result.computedArea,
			areaPotential: result.areaPotential,
		};
	});

	const computedArea = computedFeatures.reduce(
		(acc, item) => areaCalculations.addComputedAreas(acc, item.computedArea),
		areaCalculations.createEmptyComputedArea(),
	);
	const areaPotential = computedFeatures.reduce(
		(acc, item) => areaCalculations.addAreaPotentials(acc, item.areaPotential),
		areaCalculations.createEmptyAreaPotential(),
	);

	useProjectStore.setState({
		computedFeatures,
		accumulatedStats: {
			totalArea: stats.totalArea,
			inputFeaturesCount: inputFeatures.length,
			computedArea,
			areaPotential,
		},
		activeAreaPotential: activeAreaId
			? (computedFeatures.find((item) => item.code === activeAreaId)
					?.areaPotential ?? null)
			: null,
	});
};

export const createCreateScenario = (set: SetState) => {
	return (name: string) => {
		const id = createScenarioId();

		set((state) => ({
			scenarios: {
				...state.scenarios,
				[id]: {
					id,
					name,
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
	return (id: string, measure: Measure) => {
		let nextMeasures: Measure[] | null = null;

		set((state) => {
			const scenario = state.scenarios[id];
			if (!scenario) return state;
			nextMeasures = [...scenario.measures, measure];

			return {
				scenarios: {
					...state.scenarios,
					[id]: {
						...scenario,
						measures: nextMeasures,
					},
				},
			};
		});

		if (nextMeasures) {
			syncProjectDerivedSimulation(nextMeasures);
		}
	};
};

export const createRemoveMeasure = (set: SetState) => {
	return (scenarioId: string, measureId: string) => {
		let nextMeasures: Measure[] | null = null;

		set((state) => {
			const scenario = state.scenarios[scenarioId];
			if (!scenario) return state;

			const removedMeasure = scenario.measures.find((m) => m.id === measureId);
			nextMeasures = scenario.measures.filter(
				(measure) => measure.id !== measureId,
			);

			// Free any ConnectedArea that was used by this measure (polygon measures)
			let nextConnectedAreas = scenario.connectedAreas.map((ca) =>
				ca.usedByMeasureId === measureId
					? { ...ca, usedByMeasureId: null }
					: ca,
			);

			// For tree measures: free CA if no remaining trees share the same code
			if (removedMeasure?.name.startsWith("trees_") && removedMeasure.code) {
				const hasRemainingTrees = nextMeasures.some(
					(m) => m.name.startsWith("trees_") && m.code === removedMeasure.code,
				);
				if (!hasRemainingTrees) {
					nextConnectedAreas = nextConnectedAreas.map((ca) =>
						ca.usedByMeasureId === "trees" && ca.code === removedMeasure.code
							? { ...ca, usedByMeasureId: null }
							: ca,
					);
				}
			}

			return {
				scenarios: {
					...state.scenarios,
					[scenarioId]: {
						...scenario,
						measures: nextMeasures,
						connectedAreas: nextConnectedAreas,
					},
				},
			};
		});

		if (nextMeasures) {
			syncProjectDerivedSimulation(nextMeasures);
		}
	};
};

export const createUpdateMeasureValues = (set: SetState) => {
	return (
		scenarioId: string,
		measureId: string,
		values: Record<string, MeasureValue>,
	) => {
		let nextMeasures: Measure[] | null = null;

		set((state) => {
			const scenario = state.scenarios[scenarioId];
			if (!scenario) return state;

			const nextAreaValue = values.area ?? values.connectedArea;
			let nextArea: number | undefined;
			if (typeof nextAreaValue === "number") {
				nextArea = nextAreaValue;
			} else if (typeof nextAreaValue === "string") {
				nextArea = Number(nextAreaValue) || 0;
			}

			let nextConnectedArea: number | undefined;
			if (typeof values.connectedArea === "number") {
				nextConnectedArea = values.connectedArea;
			} else if (typeof values.connectedArea === "string") {
				nextConnectedArea = Number(values.connectedArea) || undefined;
			}

			nextMeasures = scenario.measures.map((measure) =>
				measure.id === measureId
					? {
							...measure,
							area: nextArea ?? measure.area,
							...(nextConnectedArea !== undefined && {
								connectedArea: nextConnectedArea,
							}),
						}
					: measure,
			);

			return {
				scenarios: {
					...state.scenarios,
					[scenarioId]: {
						...scenario,
						measures: nextMeasures,
					},
				},
			};
		});

		if (nextMeasures) {
			syncProjectDerivedSimulation(nextMeasures);
		}
	};
};

export const createSetActiveScenario = (set: SetState) => {
	return (id: string) => {
		let nextMeasures: Measure[] | null = null;

		set((state) => {
			const scenario = state.scenarios[id];
			if (!scenario) return state;
			nextMeasures = scenario.measures;

			return { activeScenarioId: id };
		});

		if (nextMeasures) {
			syncProjectDerivedSimulation(nextMeasures);
		}
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

export const createMarkConnectedAreaUsed = (set: SetState) => {
	return (
		scenarioId: string,
		connectedAreaId: string,
		measureId: string | null,
	) => {
		set((state) => {
			const scenario = state.scenarios[scenarioId];
			if (!scenario) return state;

			return {
				scenarios: {
					...state.scenarios,
					[scenarioId]: {
						...scenario,
						connectedAreas: scenario.connectedAreas.map((ca) =>
							ca.id === connectedAreaId
								? { ...ca, usedByMeasureId: measureId }
								: ca,
						),
					},
				},
			};
		});
	};
};
