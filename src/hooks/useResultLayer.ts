import { getLayerSource, getVectorLayer } from "@/lib/helpers/ol";
import { useMapStore, useResultStore, useScenarioStore } from "@/store";
import Feature from "ol/Feature";
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
			ids.forEach((id) => getLayerSource(getVectorLayer(map, id))?.clear());
			return;
		}

		const entries = result.data[dataKey] as ResultEntry[] | undefined;
		if (!Array.isArray(entries) || entries.length === 0) return;

		const resultByCode = new Map(entries.map((e) => [e[codeKey] as string, e]));

		const geometrySource = getLayerSource(getVectorLayer(map, geometryLayerId));
		if (!geometrySource) return;

		const features = geometrySource
			.getFeatures()
			.map((olFeature) => {
				const code = olFeature.get("code") as string | undefined;
				if (!code) return null;
				const entry = resultByCode.get(code);
				if (!entry) return null;
				const clone = olFeature.clone();
				clone.setProperties(entry);
				return clone;
			})
			.filter((f): f is Feature => f !== null);

		ids.forEach((id) => {
			const source = getLayerSource(getVectorLayer(map, id));
			if (!source) return;
			source.clear();
			source.addFeatures(features.map((f) => f.clone()));
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map, result, dataKey, geometryLayerId, codeKey]);
}
