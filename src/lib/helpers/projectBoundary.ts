import { getLayerById } from "@/lib/helpers/ol";
import { LAYER_IDS } from "@/types/shared";
import { intersects } from "ol/extent";
import VectorLayer from "ol/layer/Vector.js";
import type Map from "ol/Map.js";
import { Vector as VectorSource } from "ol/source.js";

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

	const rabimoLayer = getLayerById(map, LAYER_IDS.RABIMO_INPUT_2025);
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

	rabimoLayer.getSource()!.forEachFeature((rabimoFeature) => {
		const rabimoGeometry = rabimoFeature.getGeometry();
		if (!rabimoGeometry) return;

		const intersectsAny = boundaryFeatures.some((boundaryFeature) => {
			const drawnGeometry = boundaryFeature.getGeometry();
			if (!drawnGeometry) return false;

			return (
				intersects(drawnGeometry.getExtent(), rabimoGeometry.getExtent()) &&
				drawnGeometry.intersectsExtent(rabimoGeometry.getExtent())
			);
		});

		if (intersectsAny) {
			planningSource.addFeature(rabimoFeature.clone());
		}
	});
};
