import { getLayerById } from "@/lib/helpers/ol";
import type { AreaProps, InputFeature } from "@/store/project/types";
import { LAYER_IDS } from "@/types/shared";
import booleanIntersects from "@turf/boolean-intersects";
import type { Extent } from "ol/extent";
import { GeoJSON } from "ol/format";
import VectorLayer from "ol/layer/Vector";
import type Map from "ol/Map";
import { Vector as VectorSource } from "ol/source";

const RABIMO_LOAD_TIMEOUT_MS = 20000;

/**
 * The rabimo input layer uses a bbox strategy, so it only holds features for
 * extents the map has already rendered. Forces a load of the given extent and
 * resolves once the source is idle again, so an intersection run afterwards
 * sees the features of that area.
 */
export const ensureRabimoInputLoaded = (
	map: Map | null,
	extent: Extent | null,
	timeoutMs = RABIMO_LOAD_TIMEOUT_MS,
): Promise<void> => {
	const rabimoSource = getLayerById(map, LAYER_IDS.INPUT)?.getSource();

	if (!map || !rabimoSource || !extent?.every((value) => isFinite(value))) {
		return Promise.resolve();
	}

	const view = map.getView();
	rabimoSource.loadFeatures(
		extent,
		view.getResolution() ?? 1,
		view.getProjection(),
	);

	if (!rabimoSource.loading) return Promise.resolve();

	return new Promise((resolve) => {
		const settle = () => {
			clearTimeout(timeoutId);
			rabimoSource.un("featuresloadend", handleLoadSettled);
			rabimoSource.un("featuresloaderror", handleLoadSettled);
			resolve();
		};

		const handleLoadSettled = () => {
			if (!rabimoSource.loading) settle();
		};

		const timeoutId = setTimeout(settle, timeoutMs);
		rabimoSource.on("featuresloadend", handleLoadSettled);
		rabimoSource.on("featuresloaderror", handleLoadSettled);
	});
};

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
