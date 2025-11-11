"use client";

import { Button } from "@/components/ui/button";
import { useVectorUpload } from "@/components/UploadControls/hooks/useVectorUpload";
import { generateLayerId, getFileName } from "@/lib/helpers/file";
import { createVectorLayer } from "@/lib/helpers/ol/layer";
import { fitMapToExtent } from "@/lib/helpers/ol/map";
import { useLayersStore } from "@/store/layers";
import { ManagedLayer } from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { UploadIcon } from "@phosphor-icons/react";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import { FC, useCallback, useRef } from "react";

const DEFAULT_STYLE = new Style({
	stroke: new Stroke({ color: "#3b82f6", width: 2 }),
	fill: new Fill({ color: "rgba(59, 130, 246, 0.1)" }),
});

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

const UploadVectorLayersButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const { addLayer } = useLayersStore();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { uploading, handleUpload } = useVectorUpload();

	const addVectorLayerToMap = useCallback(
		(features: Feature[], fileName: string) => {
			if (!map) return;

			const layerId = generateLayerId();
			const vectorLayer = createVectorLayer(
				features,
				fileName,
				layerId,
				DEFAULT_STYLE,
			);

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
