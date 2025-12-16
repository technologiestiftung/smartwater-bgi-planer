"use client";

import { Button } from "@/components/ui/button";
import { useVectorUpload } from "@/components/UploadControls/hooks/useVectorUpload";
import { generateLayerId } from "@/lib/helpers/file";
import {
	createManagedLayer,
	createVectorLayer,
	DEFAULT_STYLE,
	fitMapToExtent,
} from "@/lib/helpers/ol";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { UploadIcon } from "@phosphor-icons/react";
import { Feature } from "ol";
import { FC, useCallback, useRef } from "react";

const UploadVectorLayersButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const addLayer = useLayersStore((state) => state.addLayer);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { uploading, handleUpload } = useVectorUpload();

	const addVectorLayerToMap = useCallback(
		(features: Feature[], fileName: string) => {
			if (!map) return;

			const layerId = generateLayerId();
			const vectorLayer = createVectorLayer({
				features,
				fileName,
				layerId,
				style: DEFAULT_STYLE,
			});

			vectorLayer.setZIndex(501);
			map.addLayer(vectorLayer);
			addLayer(createManagedLayer(layerId, fileName, vectorLayer));
			fitMapToExtent(map, vectorLayer);
		},
		[map, addLayer],
	);

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		await handleUpload(file, (features, uploadedFile) => {
			addVectorLayerToMap(features, uploadedFile.name);
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

export default UploadVectorLayersButton;
