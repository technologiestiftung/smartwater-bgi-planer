import { convertShapefile } from "@/lib/serverActions/convertShapefile";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import { Feature } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import { useCallback, useState } from "react";

export const useVectorUpload = () => {
	const map = useMapStore((state) => state.map);
	const { setUploadError, setUploadSuccess, clearUploadStatus } = useUiStore();
	const [uploading, setUploading] = useState(false);

	const parseGeoJSON = useCallback(
		(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			geojson: any,
		): Feature[] => {
			if (!map) return [];

			const format = new GeoJSON();
			const crsMatch = geojson.crs?.properties?.name?.match(/EPSG[:\s]+(\d+)/i);
			const sourceProjection = crsMatch ? `EPSG:${crsMatch[1]}` : "EPSG:4326";
			const mapProjection = map.getView().getProjection().getCode();

			return format.readFeatures(geojson, {
				dataProjection: sourceProjection,
				featureProjection: mapProjection,
			});
		},
		[map],
	);

	const processFile = useCallback(
		async (file: File): Promise<Feature[]> => {
			const lowerName = file.name.toLowerCase();

			if (lowerName.endsWith(".zip")) {
				const formData = new FormData();
				formData.append("file", file);
				const geojson = await convertShapefile(formData);
				return parseGeoJSON(geojson);
			} else if (
				lowerName.endsWith(".geojson") ||
				lowerName.endsWith(".json")
			) {
				const text = await file.text();
				const geojson = JSON.parse(text);
				return parseGeoJSON(geojson);
			} else {
				throw new Error(
					"Unsupported file type. Upload a .geojson, .json, or zipped shapefile (.zip).",
				);
			}
		},
		[parseGeoJSON],
	);

	const handleUpload = useCallback(
		async (
			file: File,
			onSuccess: (features: Feature[], file: File) => void | Promise<void>,
		) => {
			setUploading(true);
			setUploadError(null);
			setUploadSuccess(null);
			clearUploadStatus();

			try {
				const features = await processFile(file);
				await onSuccess(features, file);
				setUploadSuccess(`${file.name} erfolgreich importiert.`);
			} catch (err) {
				console.error(err instanceof Error && err.message);
				setUploadError(
					`${file.name} konnte nicht importiert werden. Laden sie eine GeoJSON oder Shapefile Datei in EPSG:25833 oder EPSG:4326 Koordinatensystem hoch.`,
				);
			} finally {
				setUploading(false);
			}
		},
		[processFile, setUploadError, setUploadSuccess, clearUploadStatus],
	);

	return { uploading, handleUpload };
};
