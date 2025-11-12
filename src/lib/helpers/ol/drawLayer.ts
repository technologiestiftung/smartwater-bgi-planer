import { getLayerIdsInFolder } from "@/lib/helpers/ol/layer";
import { getLayerById } from "@/lib/helpers/ol/map";
import { useMapStore } from "@/store/map";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import type Map from "ol/Map";
import VectorSource from "ol/source/Vector";

const format = new GeoJSON();

const getVectorLayer = (map: Map, layerId: string) => {
	return getLayerById(map, layerId) as VectorLayer<VectorSource> | null;
};

const getLayerSource = (layer: VectorLayer<VectorSource> | null) => {
	return layer?.getSource() ?? null;
};

/**
 * Exports a function that exports a layer as a GeoJSON file.
 * @param {map} The map containing the layer to export.
 * @param {layerId} The ID of the layer to export.
 * @return {File | null} The exported GeoJSON file.
 */
export const exportDrawLayerAsGeoJSON = (
	map: Map,
	layerId: string,
): File | null => {
	const layer = getVectorLayer(map, layerId);
	if (!layer) {
		console.warn(`[exportDrawLayerAsGeoJSON] Layer ${layerId} not found`);
		return null;
	}

	const source = getLayerSource(layer);
	if (!source) {
		console.warn(`[exportDrawLayerAsGeoJSON] Layer ${layerId} has no source`);
		return null;
	}

	const features = source.getFeatures();
	if (features.length === 0) return null;

	try {
		const geojsonObject = format.writeFeaturesObject(features, {
			featureProjection: map.getView().getProjection().getCode(),
			dataProjection: "EPSG:4326",
		});

		const blob = new Blob([JSON.stringify(geojsonObject, null, 2)], {
			type: "application/json",
		});

		return new File([blob], `${layerId}.geojson`, { type: "application/json" });
	} catch (error) {
		console.error(
			`[exportDrawLayerAsGeoJSON] Error exporting layer ${layerId}:`,
			error,
		);
		return null;
	}
};

/**
 * Import a layer from a GeoJSON file.
 * @param {map} The map which the layer belongs to.
 * @param {layerId} The id of the layer.
 * @param {file} The GeoJSON file to import.
 * @returns {Promise<boolean} A promise which resolves when the layer is imported successfully.
 */
export const importDrawLayerFromGeoJSON = async (
	map: Map,
	layerId: string,
	file: File,
): Promise<boolean> => {
	try {
		const geojsonObject = JSON.parse(await file.text());
		const features = format.readFeatures(geojsonObject, {
			dataProjection: "EPSG:4326",
			featureProjection: map.getView().getProjection().getCode(),
		});

		const layer = getVectorLayer(map, layerId);
		if (!layer) {
			console.warn(
				`[importDrawLayerFromGeoJSON] Layer ${layerId} not found. Layer should be initialized by LayerInitializer first.`,
			);
			return false;
		}

		const source = getLayerSource(layer);
		if (!source) {
			console.error(
				`[importDrawLayerFromGeoJSON] Layer ${layerId} has no source`,
			);
			return false;
		}

		source.clear();
		source.addFeatures(features);
		return true;
	} catch (error) {
		console.error(
			`[importDrawLayerFromGeoJSON] Error importing to layer ${layerId}:`,
			error,
		);
		return false;
	}
};

/**
 * drawLayerHasFeatures returns true if the layer has features, otherwise false.
 * @param {map} Map
 * @param {layerId} string
 * @return {boolean}
 */
export const drawLayerHasFeatures = (map: Map, layerId: string): boolean => {
	const layer = getVectorLayer(map, layerId);
	const source = getLayerSource(layer);
	return source ? source.getFeatures().length > 0 : false;
};

/**
 * Returns an array of all draw layer IDs in the current project.
 * @return {string[]} An array of draw layer IDs.
 */
export const getAllDrawLayerIds = (): string[] => {
	try {
		const { config } = useMapStore.getState();
		const elements = config?.layerConfig?.subjectlayer?.elements;

		if (elements) {
			return Array.from(getLayerIdsInFolder(elements, "Draw Layers"));
		}
	} catch (error) {
		console.error("[getAllDrawLayerIds] Error getting draw layer IDs:", error);
	}
	return [];
};

export const isDrawLayer = (layerId: string): boolean => {
	return getAllDrawLayerIds().includes(layerId);
};
