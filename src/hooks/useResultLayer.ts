import { getLayerSource, getVectorLayer } from "@/lib/helpers/ol";
import { useMapStore, useResultStore, useScenarioStore } from "@/store";
import Feature from "ol/Feature";
import type OLMap from "ol/Map";
import { useEffect } from "react";

interface ResultEntry {
	[key: string]: unknown;
}

interface UseResultLayerOptions {
	layerIds: string | string[];
	dataKey: string;
	geometryLayerId?: string;
	codeKey?: string;
}

function getByPath(obj: unknown, path: string): unknown {
	return path.split(".").reduce<unknown>((node, key) => {
		if (typeof node !== "object" || node === null) return undefined;
		return (node as Record<string, unknown>)[key];
	}, obj);
}

function getSource(map: OLMap, layerId: string) {
	return getLayerSource(getVectorLayer(map, layerId));
}

function clearLayers(map: OLMap, layerIds: string[]) {
	layerIds.forEach((id) => getSource(map, id)?.clear());
}

function buildFeatures(
	geometrySource: ReturnType<typeof getSource>,
	resultByCode: Map<string, ResultEntry>,
): Feature[] {
	if (!geometrySource) return [];

	return geometrySource
		.getFeatures()
		.map((olFeature) => {
			const code = olFeature.get("code") as string | undefined;
			const entry = code && resultByCode.get(code);
			if (!entry) return null;

			const clone = olFeature.clone();
			clone.setProperties(entry);
			return clone;
		})
		.filter((f): f is Feature => f !== null);
}

export function useResultLayer({
	layerIds,
	dataKey,
	geometryLayerId = "project_btf_planning",
	codeKey = "code",
}: UseResultLayerOptions) {
	const map = useMapStore((state) => state.map);
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const result = useResultStore((state) =>
		activeScenarioId ? state.resultsByScenarioId[activeScenarioId] : undefined,
	);

	const ids = Array.isArray(layerIds) ? layerIds : [layerIds];

	useEffect(() => {
		if (!map) return;

		if (!result) {
			clearLayers(map, ids);
			return;
		}

		const entries = getByPath(result.data, dataKey) as
			ResultEntry[] | undefined;
		if (!Array.isArray(entries) || entries.length === 0) return;

		const resultByCode = new Map(entries.map((e) => [e[codeKey] as string, e]));
		const features = buildFeatures(
			getSource(map, geometryLayerId),
			resultByCode,
		);

		ids.forEach((id) => {
			const source = getSource(map, id);
			if (!source) return;
			source.clear();
			source.addFeatures(features.map((f) => f.clone()));
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map, result, dataKey, geometryLayerId, codeKey]);
}
