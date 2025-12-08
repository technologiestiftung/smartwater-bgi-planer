"use client";

import { Button } from "@/components/ui/button";
import { useVectorUpload } from "@/components/UploadControls/hooks/useVectorUpload";
import {
	ensureVectorLayer,
	fitMapToExtent,
	getLayerById,
} from "@/lib/helpers/ol";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { LAYER_IDS } from "@/types/shared";
import { UploadIcon } from "@phosphor-icons/react";
import { Feature } from "ol";
import { intersects } from "ol/extent";
import { FC, useCallback, useRef } from "react";

const UploadDrawLayerButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { uploading, handleUpload } = useVectorUpload();

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

	const addFeaturesToDrawLayer = useCallback(
		(features: Feature[]) => {
			if (!map || !drawLayerId) return;

			const layer = ensureVectorLayer(map, drawLayerId);
			const source = layer.getSource()!;

			if (drawLayerId === LAYER_IDS.PROJECT_BOUNDARY) {
				source.clear();
				source.addFeatures(features);
				source.changed();
				performIntersection();
			} else {
				source.addFeatures(features);
				source.changed();
			}

			fitMapToExtent(map, layer);
		},
		[map, drawLayerId, performIntersection],
	);

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		await handleUpload(file, async (features) => {
			addFeaturesToDrawLayer(features);
		});

		if (fileInputRef.current) fileInputRef.current.value = "";
	};

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
				{uploading ? "Datei lädt..." : "Datei hochladen"}
			</Button>
		</div>
	);
};

export default UploadDrawLayerButton;
