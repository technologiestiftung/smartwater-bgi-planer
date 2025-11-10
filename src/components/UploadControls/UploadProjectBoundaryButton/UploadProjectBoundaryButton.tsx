"use client";

import { Button } from "@/components/ui/button";
import { useVectorUpload } from "@/components/UploadControls/hooks/useVectorUpload";
import { ensureVectorLayer } from "@/lib/helper/layerHelpers";
import { getLayerById } from "@/lib/helper/mapHelpers";
import { useFilesStore } from "@/store/files";
import { useMapStore } from "@/store/map";
import { useProjectsStore } from "@/store/projects";
import { LAYER_IDS } from "@/types/shared";
import { UploadIcon } from "@phosphor-icons/react";
import { Feature } from "ol";
import { intersects } from "ol/extent";
import { FC, useCallback, useRef } from "react";

const UploadProjectBoundaryButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const getProject = useProjectsStore((state) => state.getProject);
	const addFile = useFilesStore((state) => state.addFile);
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

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		await handleUpload(file, async (features, uploadedFile) => {
			addProjectBoundaryFeaturesToMap(features);

			const project = getProject();
			if (project) {
				await addFile(project.id, LAYER_IDS.PROJECT_BOUNDARY, uploadedFile);
			}
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

export default UploadProjectBoundaryButton;
