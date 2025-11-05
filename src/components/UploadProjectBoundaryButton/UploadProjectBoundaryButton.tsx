/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { ensureVectorLayer } from "@/lib/helper/layerHelpers";
import { getLayerById } from "@/lib/helper/mapHelpers";
import { convertShapefile } from "@/lib/serverActions/convertShapefile";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import { UploadIcon } from "@phosphor-icons/react";
import { Feature } from "ol";
import { intersects } from "ol/extent";
import GeoJSON from "ol/format/GeoJSON";
import { FC, useCallback, useRef, useState } from "react";

const UploadProjectBoundaryButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { setUploadError, setUploadSuccess, clearUploadStatus } = useUiStore();

	const performIntersection = useCallback(() => {
		if (!map) return;

		const projectBoundaryLayer = getLayerById(map, LAYER_IDS.PROJECT_BOUNDARY);
		const boundaryFeatures =
			projectBoundaryLayer?.getSource()?.getFeatures() || [];

		const planningLayer = ensureVectorLayer(
			map,
			LAYER_IDS.PROJECT_BTF_PLANNING,
		);
		const planningSource = planningLayer.getSource()!;
		planningSource.clear();

		if (boundaryFeatures.length === 0) return;

		const rabimoLayer = getLayerById(map, LAYER_IDS.RABIMO_INPUT_2025);
		if (!rabimoLayer?.getSource()) return;

		const addedIds = new Set<string>();

		rabimoLayer.getSource()!.forEachFeature((rabimoFeature) => {
			const rabimoGeometry = rabimoFeature.getGeometry();
			if (!rabimoGeometry) return;

			const hasIntersection = boundaryFeatures.some((boundaryFeature) => {
				const boundaryGeometry = boundaryFeature.getGeometry();
				return (
					boundaryGeometry &&
					intersects(
						boundaryGeometry.getExtent(),
						rabimoGeometry.getExtent(),
					) &&
					boundaryGeometry.intersectsExtent(rabimoGeometry.getExtent())
				);
			});

			if (hasIntersection) {
				const featureId =
					rabimoFeature.getId() !== undefined
						? String(rabimoFeature.getId())
						: JSON.stringify(rabimoFeature.getProperties());
				if (!addedIds.has(featureId)) {
					planningSource.addFeature(rabimoFeature.clone());
					addedIds.add(featureId);
				}
			}
		});
	}, [map]);

	const addProjectBoundaryFeaturesToMap = useCallback(
		(features: Feature[]) => {
			if (!map) return;

			const boundaryLayer = ensureVectorLayer(map, LAYER_IDS.PROJECT_BOUNDARY);
			const boundarySource = boundaryLayer.getSource()!;

			boundarySource.clear();
			boundarySource.addFeatures(features);

			performIntersection();

			const extent = boundarySource.getExtent();
			if (extent?.every((val) => isFinite(val))) {
				map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 500 });
			}
		},
		[map, performIntersection],
	);

	const handleGeoJSONData = useCallback(
		async (geojson: any) => {
			if (!map) return;

			const format = new GeoJSON();
			const crsMatch = geojson.crs?.properties?.name?.match(/EPSG[:\s]+(\d+)/i);
			const sourceProjection = crsMatch ? `EPSG:${crsMatch[1]}` : "EPSG:4326";
			const mapProjection = map.getView().getProjection().getCode();

			const features = format.readFeatures(geojson, {
				dataProjection: sourceProjection,
				featureProjection: mapProjection,
			});

			addProjectBoundaryFeaturesToMap(features);
		},
		[map, addProjectBoundaryFeaturesToMap],
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
				const lowerName = file.name.toLowerCase();

				if (lowerName.endsWith(".zip")) {
					const formData = new FormData();
					formData.append("file", file);

					const geojson = await convertShapefile(formData);
					await handleGeoJSONData(geojson);
				} else if (
					lowerName.endsWith(".geojson") ||
					lowerName.endsWith(".json")
				) {
					const text = await file.text();
					const geojson = JSON.parse(text);
					await handleGeoJSONData(geojson);
				} else {
					throw new Error(
						"Unsupported file type. Upload a .geojson, .json, or zipped shapefile (.zip).",
					);
				}

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
		[handleGeoJSONData, setUploadError, setUploadSuccess, clearUploadStatus],
	);

	return (
		<div className="flex flex-col gap-2">
			<input
				ref={fileInputRef}
				type="file"
				accept=".geojson,.json,.zip"
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

export default UploadProjectBoundaryButton;
