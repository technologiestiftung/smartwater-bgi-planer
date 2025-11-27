import { getLayerSource, getVectorLayer } from "@/lib/helpers/ol";
import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import GeoJSON from "ol/format/GeoJSON";
import type Map from "ol/Map";

interface GeoJSONWithMetadata
	extends FeatureCollection<Geometry, GeoJsonProperties> {
	metadata?: Record<string, any>;
}

const format = new GeoJSON();

export const exportLayerAsGeoJSON = (
	map: Map,
	layerId: string,
	metadata?: Record<string, any>,
): File | null => {
	const layer = getVectorLayer(map, layerId);
	if (!layer) {
		console.warn(`[exportLayerAsGeoJSON] Layer ${layerId} not found`);
		return null;
	}

	const source = getLayerSource(layer);
	if (!source) {
		console.warn(`[exportLayerAsGeoJSON] Layer ${layerId} has no source`);
		return null;
	}

	const features = source.getFeatures();
	if (features.length === 0) return null;

	try {
		const geojsonObject = format.writeFeaturesObject(features, {
			featureProjection: map.getView().getProjection().getCode(),
			dataProjection: "EPSG:4326",
		}) as GeoJSONWithMetadata;

		if (metadata) {
			geojsonObject.metadata = metadata;
		}

		const blob = new Blob([JSON.stringify(geojsonObject, null, 2)], {
			type: "application/json",
		});

		return new File([blob], `${layerId}.geojson`, { type: "application/json" });
	} catch (error) {
		console.error(
			`[exportLayerAsGeoJSON] Error exporting layer ${layerId}:`,
			error,
		);
		return null;
	}
};

export const importLayerFromGeoJSON = async (
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
			console.warn(`[importLayerFromGeoJSON] Layer ${layerId} not found`);
			return false;
		}

		const source = getLayerSource(layer);
		if (!source) {
			console.error(`[importLayerFromGeoJSON] Layer ${layerId} has no source`);
			return false;
		}

		source.clear();
		source.addFeatures(features);
		return true;
	} catch (error) {
		console.error(
			`[importLayerFromGeoJSON] Error importing to layer ${layerId}:`,
			error,
		);
		return false;
	}
};
