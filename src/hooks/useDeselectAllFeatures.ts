"use client";

import { getLayerById } from "@/lib/helpers/ol";
import { useFilesStore } from "@/store/files";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useProjectStore } from "@/store/project";
import Select from "ol/interaction/Select";
import { Vector as VectorSource } from "ol/source";
import { useCallback } from "react";

export function useDeselectAllFeatures() {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const getProject = useProjectStore((state) => state.getProject);
	const deleteFile = useFilesStore((state) => state.deleteFile);

	const deselectAllFeatures = useCallback(() => {
		if (!map) return;

		// Clear selection from any active Select interactions
		map.getInteractions().forEach((interaction) => {
			if (interaction instanceof Select) {
				interaction.getFeatures().clear();
			}
		});
	}, [map]);

	const clearDrawLayerFeatures = useCallback(() => {
		if (!map || !drawLayerId) return;

		const drawLayer = getLayerById(map, drawLayerId);
		if (!drawLayer) return;

		const source = drawLayer.getSource();
		if (source instanceof VectorSource) {
			source.clear();
			source.changed();

			const project = getProject();
			if (project) {
				deleteFile(project.id, drawLayerId);
			}
		}
	}, [map, drawLayerId, getProject, deleteFile]);

	return { deselectAllFeatures, clearDrawLayerFeatures };
}
