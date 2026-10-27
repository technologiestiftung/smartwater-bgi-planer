import areaCalculations from "@/lib/simulation/calculations/areaCalculations";
import { simulationEngine } from "@/lib/simulation/simulationEngine";
import { useProjectStore } from "@/store/project";
import { ComputedFeatures } from "@/store/project/types";
import { useUiStore } from "@/store/ui";
import { ConnectedArea, Measure, ScenarioState } from "./types";

type SetState = (fn: (state: ScenarioState) => Partial<ScenarioState>) => void;
type GetState = () => ScenarioState;

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

	// Measures deleted but not yet confirmed must not use up capacity.
	const { pendingDeleteMeasureIds } = useUiStore.getState();

	const computedFeatures: ComputedFeatures[] = stats.features.map((item) => {
		const result = simulationEngine.applyMeasures(
			item.computedArea,
			measures.filter(
				(measure) =>
					measure.code === item.code &&
					!pendingDeleteMeasureIds.includes(measure.id),
			),
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
			activeScenarioId:
				state.activeScenarioId && state.scenarios[state.activeScenarioId]
					? state.activeScenarioId
					: id,
			scenarios: {
				...state.scenarios,
				[id]: {
					id,
					name,
					connectedAreas: [],
					measures: [],
				},
			},
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

export const createAddMeasure = (set: SetState, get: GetState) => {
	return (id: string, measure: Measure) => {
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

		// Read back via get() rather than the producer's draft: immer revokes
		// the draft proxies as soon as the set() callback above returns.
		const measures = get().scenarios[id]?.measures;
		if (measures) {
			syncProjectDerivedSimulation(measures);
		}
	};
};

const freeTreeGroupConnectedArea = (
	removedMeasure: Measure,
	remainingMeasures: Measure[],
	connectedAreas: ConnectedArea[],
): ConnectedArea[] => {
	const groupId = removedMeasure.connectedAreaId;
	const { code } = removedMeasure;
	if (!groupId && !code) return connectedAreas;

	const hasRemainingTrees = remainingMeasures.some(
		(m) =>
			m.name.startsWith("trees_") &&
			(groupId ? m.connectedAreaId === groupId : m.code === code),
	);
	if (hasRemainingTrees) return connectedAreas;

	return connectedAreas.map((ca) =>
		ca.usedByMeasureId === "trees" &&
		(groupId ? ca.id === groupId : ca.code === code)
			? { ...ca, usedByMeasureId: null }
			: ca,
	);
};

export const createRemoveMeasure = (set: SetState, get: GetState) => {
	return (scenarioId: string, measureId: string) => {
		set((state) => {
			const scenario = state.scenarios[scenarioId];
			if (!scenario) return state;

			const removedMeasure = scenario.measures.find((m) => m.id === measureId);
			const nextMeasures = scenario.measures.filter(
				(measure) => measure.id !== measureId,
			);

			// Free any ConnectedArea that was used by this measure (polygon measures)
			let nextConnectedAreas = scenario.connectedAreas.map((ca) =>
				ca.usedByMeasureId === measureId
					? { ...ca, usedByMeasureId: null }
					: ca,
			);

			if (removedMeasure?.name.startsWith("trees_")) {
				nextConnectedAreas = freeTreeGroupConnectedArea(
					removedMeasure,
					nextMeasures,
					nextConnectedAreas,
				);
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

		const measures = get().scenarios[scenarioId]?.measures;
		if (measures) {
			syncProjectDerivedSimulation(measures);
		}
	};
};

export const createSetActiveScenario = (set: SetState, get: GetState) => {
	return (id: string) => {
		set((state) => {
			const scenario = state.scenarios[id];
			if (!scenario) return state;

			return { activeScenarioId: id };
		});

		const measures = get().scenarios[id]?.measures;
		if (measures) {
			syncProjectDerivedSimulation(measures);
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
