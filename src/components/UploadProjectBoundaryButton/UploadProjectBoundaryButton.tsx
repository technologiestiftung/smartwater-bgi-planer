"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ensureVectorLayer } from "@/lib/helper/layerHelpers";
import { getLayerById } from "@/lib/helper/mapHelpers";
import { useMapStore } from "@/store/map";
import { LAYER_IDS } from "@/types/shared";
import { Feature } from "ol";
import { intersects } from "ol/extent";
import GeoJSON from "ol/format/GeoJSON";
import { FC, useCallback, useRef, useState } from "react";

const UploadProjectBoundaryButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const handleGeoJSONUpload = useCallback(
		async (file: File) => {
			if (!map) return;

			const text = await file.text();
			const geojson = JSON.parse(text);
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
			setError(null);

			try {
				if (!file.name.toLowerCase().match(/\.(geojson|json)$/)) {
					throw new Error("Please upload a GeoJSON file (.geojson or .json).");
				}

				await handleGeoJSONUpload(file);
				setDialogOpen(false);
				if (fileInputRef.current) fileInputRef.current.value = "";
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to upload file");
			} finally {
				setUploading(false);
			}
		},
		[handleGeoJSONUpload],
	);

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button>Upload Project Boundary</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Upload Project Boundary</DialogTitle>
					<DialogDescription>
						Upload a GeoJSON file to define the project boundary. The projection
						will be automatically converted to match the map (EPSG:25833).
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="flex flex-col gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept=".geojson,.json"
							onChange={handleFileChange}
							className="hidden"
						/>
						<Button
							onClick={() => fileInputRef.current?.click()}
							disabled={uploading}
							className="w-full"
						>
							{uploading ? "Uploading..." : "Choose File"}
						</Button>
						<p className="text-xs text-muted-foreground">
							Supported formats: GeoJSON (.geojson, .json)
						</p>
					</div>
					{error && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{error}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default UploadProjectBoundaryButton;
