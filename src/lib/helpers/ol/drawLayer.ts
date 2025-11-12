import { getLayerIdsInFolder } from "@/lib/helpers/ol/layer";
import { getLayerById } from "@/lib/helpers/ol/map";
import { useMapStore } from "@/store/map";
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
			dataProjection: "EPSG:4326",
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
			dataProjection: "EPSG:4326",
			featureProjection: mapProjection,
		});

		const layer = getLayerById(
			map,
			layerId,
		) as VectorLayer<VectorSource> | null;

		if (!layer) {
			console.warn(
				`[importDrawLayerFromGeoJSON] Layer ${layerId} not found. Layer should be initialized by LayerInitializer first.`,
			);
			return false;
		}

		const source = layer.getSource();
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
 * Returns an array of draw layer ids.
 * @returns {string[]} - Returns an array of draw layer ids.
 * @throws {Error} - If an error occurs while getting draw layer IDs.
 */
export const getAllDrawLayerIds = (): string[] => {
	try {
		const { config } = useMapStore.getState();

		if (config?.layerConfig?.subjectlayer?.elements) {
			const drawLayerIdsSet = getLayerIdsInFolder(
				config.layerConfig.subjectlayer.elements,
				"Draw Layers",
			);
			const result = Array.from(drawLayerIdsSet);
			if (result.length > 0) {
				return result;
			}
		}
	} catch (error) {
		console.error("[getAllDrawLayerIds] Error getting draw layer IDs:", error);
		return [];
	}
	return [];
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
