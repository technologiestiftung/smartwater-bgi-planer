import { getLayerIdsInFolder } from "@/lib/helpers/ol/layer";
import { getLayerById } from "@/lib/helpers/ol/map";
import { useLayersStore } from "@/store/layers";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import type Map from "ol/Map";
import VectorSource from "ol/source/Vector";

/**
 * Exports a draw layer as a GeoJSON file.
 * @param {map} Map
 * @param {layerId} string
 * @return {File | null} The file containing the layer data.
 * @throws {Error} if the layer could not be exported.
 */
export const exportDrawLayerAsGeoJSON = (
	map: Map,
	layerId: string,
): File | null => {
	const layer = getLayerById(map, layerId) as VectorLayer<VectorSource> | null;

	if (!layer) {
		console.warn(`[exportDrawLayerAsGeoJSON] Layer ${layerId} not found`);
		return null;
	}

	const source = layer.getSource();
	if (!source) {
		console.warn(`[exportDrawLayerAsGeoJSON] Layer ${layerId} has no source`);
		return null;
	}

	const features = source.getFeatures();

	if (features.length === 0) {
		return null;
	}

	const format = new GeoJSON();
	const mapProjection = map.getView().getProjection().getCode();

	try {
		const geojsonObject = format.writeFeaturesObject(features, {
			featureProjection: mapProjection,
			dataProjection: "EPSG:4326", // Standard GeoJSON projection
		});

		const geojsonString = JSON.stringify(geojsonObject, null, 2);
		const blob = new Blob([geojsonString], { type: "application/json" });

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
 * This function imports a draw layer from a GeoJSON file into a Map.
 * @param {map} Map
 * @param {layerId} string
 * @param {file} File
 * @returns Promise<boolean>
 * @throws Error if the layer could not be imported.
 */
export const importDrawLayerFromGeoJSON = async (
	map: Map,
	layerId: string,
	file: File,
): Promise<boolean> => {
	try {
		const geojsonText = await file.text();
		const geojsonObject = JSON.parse(geojsonText);

		const format = new GeoJSON();
		const mapProjection = map.getView().getProjection().getCode();

		const features = format.readFeatures(geojsonObject, {
			dataProjection: "EPSG:4326", // GeoJSON standard projection
			featureProjection: mapProjection,
		});

		// Get or create the layer
		let layer = getLayerById(map, layerId) as VectorLayer<VectorSource> | null;

		if (!layer) {
			// Create layer if it doesn't exist
			const source = new VectorSource();
			layer = new VectorLayer({ source });
			layer.set("id", layerId);
			map.addLayer(layer);
		}

		const source = layer.getSource();
		if (!source) {
			console.error(
				`[importDrawLayerFromGeoJSON] Layer ${layerId} has no source`,
			);
			return false;
		}

		// Clear existing features and add imported ones
		source.clear();
		source.addFeatures(features);

		console.log(
			`[importDrawLayerFromGeoJSON] Successfully imported ${features.length} features to layer ${layerId}`,
		);
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
 * Returns true if the layer has features, otherwise false.
 * @param {map} Map
 * @param {layerId} string
 * @return {boolean}
 * **/
export const drawLayerHasFeatures = (map: Map, layerId: string): boolean => {
	const layer = getLayerById(map, layerId) as VectorLayer<VectorSource> | null;

	if (!layer) {
		return false;
	}

	const source = layer.getSource();
	if (!source) {
		return false;
	}

	return source.getFeatures().length > 0;
};

/**
 * Returns the number of features in the draw layer.
 * @param {map} Map
 * @param {layerId} string
 * @return {number}
 * **/
export const getDrawLayerFeatureCount = (map: Map, layerId: string): number => {
	const layer = getLayerById(map, layerId) as VectorLayer<VectorSource> | null;

	if (!layer) {
		return 0;
	}

	const source = layer.getSource();
	if (!source) {
		return 0;
	}

	return source.getFeatures().length;
};

/**
 * Return an array of all draw layer IDs from the given set of flattened layer elements.
 */
export const getAllDrawLayerIds = (): string[] => {
	const { flattenedLayerElements } = useLayersStore.getState();

	const drawLayerIdsSet = getLayerIdsInFolder(
		flattenedLayerElements,
		"Draw Layers",
	);

	return Array.from(drawLayerIdsSet);
};

/**
 * Checks if a given layerId is a draw layer.
 * @param layerId - The id of the layer to check.
 * @returns {boolean} - True if the layer is a draw layer, false otherwise.
 */
export const isDrawLayer = (layerId: string): boolean => {
	const drawLayerIds = getAllDrawLayerIds();
	return drawLayerIds.includes(layerId);
};
