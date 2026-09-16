"use client";

import { Button } from "@/components/ui/button";
import { useVectorUpload } from "@/components/UploadControls/hooks/useVectorUpload";
import { ensureVectorLayer, fitMapToExtent } from "@/lib/helpers/ol";
import {
	ensureRabimoInputLoaded,
	getInputFeatures,
	performProjectBoundaryIntersection,
} from "@/lib/helpers/projectBoundary";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useProjectStore } from "@/store/project";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import { UploadIcon } from "@phosphor-icons/react";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { FC, useCallback, useRef } from "react";

export const UploadDrawLayerButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const setInputFeatures = useProjectStore((state) => state.setInputFeatures);
	const setIsBoundaryIntersecting = useUiStore(
		(state) => state.setIsBoundaryIntersecting,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { uploading, handleUpload } = useVectorUpload();

	const applyProjectBoundary = useCallback(
		async (boundaryLayer: VectorLayer<VectorSource>) => {
			if (!map) return;

			setIsBoundaryIntersecting(true);
			try {
				fitMapToExtent(map, boundaryLayer);
				await ensureRabimoInputLoaded(
					map,
					boundaryLayer.getSource()!.getExtent(),
				);

				performProjectBoundaryIntersection(map);
				setInputFeatures(getInputFeatures(map));
			} finally {
				setIsBoundaryIntersecting(false);
			}
		},
		[map, setInputFeatures, setIsBoundaryIntersecting],
	);

	const addFeaturesToDrawLayer = useCallback(
		async (features: Feature[]) => {
			if (!map || !drawLayerId) return;

			const layer = ensureVectorLayer(map, drawLayerId);
			const source = layer.getSource()!;

			if (drawLayerId === LAYER_IDS.PROJECT_BOUNDARY) {
				source.clear();
				source.addFeatures(features);
				source.changed();
				await applyProjectBoundary(layer);
				return;
			}

			source.addFeatures(features);
			source.changed();
			fitMapToExtent(map, layer);
		},
		[map, drawLayerId, applyProjectBoundary],
	);

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		await handleUpload(file, (features) => addFeaturesToDrawLayer(features));

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
