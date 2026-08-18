import { getLayerById } from "@/lib/helpers/ol";
import type { AreaProps, InputFeature } from "@/store/project/types";
import { LAYER_IDS } from "@/types/shared";
import booleanIntersects from "@turf/boolean-intersects";
import type { Extent } from "ol/extent";
import { isEmpty as isEmptyExtent } from "ol/extent";
import { GeoJSON } from "ol/format";
import VectorLayer from "ol/layer/Vector";
import type Map from "ol/Map";
import { Vector as VectorSource } from "ol/source";

/**
 * Performs intersection between project boundary and rabimo input layer
 * to update the BTF planning layer
 */
export const performProjectBoundaryIntersection = (map: Map | null) => {
	if (!map) return;

	const projectBoundaryLayer = getLayerById(map, LAYER_IDS.PROJECT_BOUNDARY);
	if (!projectBoundaryLayer?.getSource()) {
		console.error("Project Boundary Layer not found.");
		return;
	}

	const projectBoundarySource = projectBoundaryLayer.getSource()!;
	const boundaryFeatures = projectBoundarySource.getFeatures();

	if (boundaryFeatures.length === 0) {
		getLayerById(map, LAYER_IDS.PROJECT_BTF_PLANNING)?.getSource()?.clear();
		return;
	}

	const rabimoLayer = getLayerById(map, LAYER_IDS.INPUT);
	if (!rabimoLayer?.getSource()) {
		console.warn("Rabimo Input Layer not found.");
		return;
	}

	let planningLayer = getLayerById(map, LAYER_IDS.PROJECT_BTF_PLANNING);
	let planningSource: VectorSource;

	if (!planningLayer) {
		planningSource = new VectorSource();
		planningLayer = new VectorLayer({
			source: planningSource,
		});
		planningLayer.set("id", LAYER_IDS.PROJECT_BTF_PLANNING);
		map.addLayer(planningLayer);
	} else {
		planningSource = planningLayer.getSource()!;
	}

	planningSource.clear();

	const format = new GeoJSON();

	rabimoLayer.getSource()!.forEachFeature((rabimoFeature) => {
		const rabimoGeometry = rabimoFeature.getGeometry();
		if (!rabimoGeometry) return;

		try {
			const rabimoGeoJSON = format.writeFeatureObject(rabimoFeature);

			const intersectsAny = boundaryFeatures.some((boundaryFeature) => {
				const drawnGeometry = boundaryFeature.getGeometry();
				if (!drawnGeometry) return false;

				try {
					if (!rabimoGeometry.intersectsExtent(drawnGeometry.getExtent())) {
						return false;
					}

					const boundaryGeoJSON = format.writeFeatureObject(boundaryFeature);
					return booleanIntersects(rabimoGeoJSON, boundaryGeoJSON);
				} catch (error) {
					console.warn(
						"Error checking intersection for boundary feature:",
						error,
					);
					return false;
				}
			});

			if (intersectsAny) {
				planningSource.addFeature(rabimoFeature.clone());
			}
		} catch (error) {
			console.warn("Error processing feature:", error);
		}
	});
};

/**
 * Explicitly requests the rabimo_input WFS layer to load features covering
 * `extent`, resolving once that fetch (if one was needed) has settled.
 *
 * The source's `url`/`strategy` config only loads whatever extent the map
 * happens to be rendering, so `useLayerReady` being "ready" only means *some*
 * extent has loaded — not necessarily the project boundary's. Call this
 * before running the boundary intersection to make sure the right BTFs are
 * actually available first.
 */
export const ensureRabimoInputCoversExtent = (
	map: Map | null,
	extent: Extent,
	timeoutMs = 8000,
): Promise<void> => {
	return new Promise((resolve) => {
		if (!map || isEmptyExtent(extent)) {
			resolve();
			return;
		}

		const source = getLayerById(map, LAYER_IDS.INPUT)?.getSource();

		console.log(
			"[projectBoundary] ensureRabimoInputCoversExtent INSIDEEEE::",
			source,
		);

		if (!(source instanceof VectorSource)) {
			resolve();
			return;
		}

		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			source.un("featuresloadend", onLoadSettled);
			source.un("featuresloaderror", onLoadSettled);
			clearTimeout(timer);
			resolve();
		};

		const onLoadSettled = () => {
			console.log("[projectBoundary] source.loading::", source.loading);
			if (source.loading === 0) finish();
		};

		const timer = setTimeout(() => {
			console.warn(
				"[projectBoundary] Timed out waiting for rabimo_input WFS data to cover the project boundary extent.",
			);
			finish();
		}, timeoutMs);

		source.on("featuresloadend", onLoadSettled);
		source.on("featuresloaderror", onLoadSettled);

		const view = map.getView();
		source.loadFeatures(
			extent,
			view.getResolution() ?? 1,
			view.getProjection(),
		);

		if (source.loading === 0) finish();
	});
};

export const getInputFeatures = (map: Map | null): InputFeature[] => {
	if (!map) return [];

	const planningSource = getLayerById(
		map,
		LAYER_IDS.PROJECT_BTF_PLANNING,
	)?.getSource();

	if (!planningSource) return [];

	return planningSource.getFeatures().map((feature) => {
		const properties = { ...feature.getProperties() } as AreaProps;

		delete properties.geometry;

		return {
			feature,
			geometry: feature.getGeometry() ?? null,
			properties,
		};
	});
};
