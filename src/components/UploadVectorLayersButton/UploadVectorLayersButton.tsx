/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { convertShapefile } from "@/lib/serverActions/convertShapefile";
import { useLayersStore } from "@/store/layers";
import { ManagedLayer } from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import { UploadIcon } from "@phosphor-icons/react";
import { Feature } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import { FC, useCallback, useRef, useState } from "react";

const SUPPORTED_EXTENSIONS = [".geojson", ".json", ".zip"];
const DEFAULT_STYLE = new Style({
	stroke: new Stroke({ color: "#3b82f6", width: 2 }),
	fill: new Fill({ color: "rgba(59, 130, 246, 0.1)" }),
});

const generateLayerId = () =>
	`uploaded_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

const getFileName = (fullName: string) => fullName.replace(/\.[^/.]+$/, "");

const createVectorLayer = (
	features: Feature[],
	fileName: string,
	layerId: string,
) => {
	const vectorLayer = new VectorLayer({
		source: new VectorSource({ features }),
		style: DEFAULT_STYLE,
	});

	vectorLayer.set("name", getFileName(fileName));
	vectorLayer.set("id", layerId);

	return vectorLayer;
};

const createManagedLayer = (
	layerId: string,
	fileName: string,
	olLayer: VectorLayer<VectorSource>,
): ManagedLayer => ({
	id: layerId,
	config: {
		id: layerId,
		name: getFileName(fileName),
		visibility: true,
		status: "loaded",
		elements: [],
	},
	olLayer,
	status: "loaded",
	visibility: true,
	opacity: 1,
	zIndex: 999,
	layerType: "subject",
});

const fitMapToExtent = (map: any, vectorLayer: VectorLayer<VectorSource>) => {
	const extent = vectorLayer.getSource()?.getExtent();
	if (extent?.every((val) => isFinite(val))) {
		map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 500 });
	}
};

const parseGeoJSON = (geojson: any, map: any): Feature[] => {
	const format = new GeoJSON();
	const crsMatch = geojson.crs?.properties?.name?.match(/EPSG[:\s]+(\d+)/i);
	const sourceProjection = crsMatch ? `EPSG:${crsMatch[1]}` : "EPSG:4326";
	const mapProjection = map.getView().getProjection().getCode();

	return format.readFeatures(geojson, {
		dataProjection: sourceProjection,
		featureProjection: mapProjection,
	});
};

const UploadVectorLayersButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const { addLayer } = useLayersStore();
	const { setUploadError, setUploadSuccess, clearUploadStatus } = useUiStore();
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addVectorLayerToMap = useCallback(
		(features: Feature[], fileName: string) => {
			if (!map) return;

			const layerId = generateLayerId();
			const vectorLayer = createVectorLayer(features, fileName, layerId);

			map.addLayer(vectorLayer);
			addLayer(createManagedLayer(layerId, fileName, vectorLayer));
			fitMapToExtent(map, vectorLayer);
		},
		[map, addLayer],
	);

	const handleGeoJSONData = useCallback(
		async (geojson: any, fileName: string) => {
			if (!map) return;
			const features = parseGeoJSON(geojson, map);
			addVectorLayerToMap(features, fileName);
		},
		[map, addVectorLayerToMap],
	);

	const processFile = useCallback(
		async (file: File) => {
			const lowerName = file.name.toLowerCase();

			if (lowerName.endsWith(".zip")) {
				const formData = new FormData();
				formData.append("file", file);
				const geojson = await convertShapefile(formData);
				await handleGeoJSONData(geojson, file.name);
			} else if (
				lowerName.endsWith(".geojson") ||
				lowerName.endsWith(".json")
			) {
				const text = await file.text();
				const geojson = JSON.parse(text);
				await handleGeoJSONData(geojson, file.name);
			} else {
				throw new Error(
					"Unsupported file type. Upload a .geojson, .json, or zipped shapefile (.zip).",
				);
			}
		},
		[handleGeoJSONData],
	);

	const handleFileChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			setUploading(true);
			setUploadError(null);
			setUploadSuccess(null);
			clearUploadStatus();

			try {
				await processFile(file);
				setUploadSuccess(`${file.name} erfolgreich importiert.`);
				if (fileInputRef.current) fileInputRef.current.value = "";
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

	return (
		<div className="UploadVectorLayersButton-root flex flex-col gap-2">
			<input
				ref={fileInputRef}
				type="file"
				accept={SUPPORTED_EXTENSIONS.join(",")}
				onChange={handleFileChange}
				className="hidden"
			/>
			<Button
				variant="outline"
				onClick={() => fileInputRef.current?.click()}
				disabled={uploading}
			>
				<UploadIcon />
				{uploading ? "Datei Läd..." : "Datei hochladen"}
			</Button>
		</div>
	);
};

export default UploadVectorLayersButton;
