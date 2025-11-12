/**
 * Test utilities for Draw Layer Persistence functionality
 * This file demonstrates how to use the new draw layer persistence features
 */

import { getAllDrawLayerIds, isDrawLayer } from "@/lib/helpers/ol/drawLayer";
import {
	drawLayerHasFeatures,
	exportDrawLayerAsGeoJSON,
	getDrawLayerFeatureCount,
	importDrawLayerFromGeoJSON,
} from "@/lib/helpers/ol/drawLayer";
import { useFilesStore } from "@/store/files";
import type Map from "ol/Map";

/**
 * Test function to demonstrate draw layer functionality
 * Call this from browser console to test the implementation
 */
export const testDrawLayerPersistence = (map: Map, projectId: string) => {
	console.log("=== Draw Layer Persistence Test ===");

	// 1. Get all draw layer IDs
	const drawLayerIds = getAllDrawLayerIds();
	console.log(`Found ${drawLayerIds.length} draw layers:`, drawLayerIds);

	// 2. Check which layers have content
	const layersWithContent = drawLayerIds.filter((layerId) => {
		const hasFeatures = drawLayerHasFeatures(map, layerId);
		const featureCount = getDrawLayerFeatureCount(map, layerId);

		if (hasFeatures) {
			console.log(`- ${layerId}: ${featureCount} features`);
		}

		return hasFeatures;
	});

	console.log(`${layersWithContent.length} layers have content`);

	// 3. Test export for layers with content
	layersWithContent.forEach((layerId) => {
		const geoJsonFile = exportDrawLayerAsGeoJSON(map, layerId);
		if (geoJsonFile) {
			console.log(`Exported ${layerId}: ${geoJsonFile.size} bytes`);

			// Optionally save to FilesStore
			const { addFile } = useFilesStore.getState();
			addFile(projectId, layerId, geoJsonFile)
				.then(() => console.log(`Saved ${layerId} to IndexedDB`))
				.catch((error) => console.error(`Error saving ${layerId}:`, error));
		}
	});

	// 4. Test layer type checking
	const testIds = ["project_boundary", "module1_notes", "not_a_draw_layer"];
	testIds.forEach((id) => {
		console.log(`${id} is draw layer: ${isDrawLayer(id)}`);
	});

	// 5. Check FilesStore
	const { getAllProjectFiles } = useFilesStore.getState();
	const projectFiles = getAllProjectFiles(projectId);
	console.log(
		`Project has ${projectFiles.length} files in IndexedDB:`,
		projectFiles.map((f) => f.layerId),
	);

	console.log("=== Test Complete ===");
};

/**
 * Test function to restore draw layers from IndexedDB
 */
export const testDrawLayerRestore = async (map: Map, projectId: string) => {
	console.log("=== Draw Layer Restore Test ===");

	const { getAllProjectFiles } = useFilesStore.getState();
	const projectFiles = getAllProjectFiles(projectId);

	console.log(`Attempting to restore ${projectFiles.length} files`);

	for (const layerFile of projectFiles) {
		if (isDrawLayer(layerFile.layerId)) {
			console.log(`Restoring ${layerFile.layerId}...`);

			const success = await importDrawLayerFromGeoJSON(
				map,
				layerFile.layerId,
				layerFile.file,
			);

			if (success) {
				const featureCount = getDrawLayerFeatureCount(map, layerFile.layerId);
				console.log(
					`✓ Restored ${layerFile.layerId} with ${featureCount} features`,
				);
			} else {
				console.error(`✗ Failed to restore ${layerFile.layerId}`);
			}
		}
	}

	console.log("=== Restore Test Complete ===");
};

// Export test functions to window for browser console access
if (typeof window !== "undefined") {
	(window as any).testDrawLayerPersistence = testDrawLayerPersistence;
	(window as any).testDrawLayerRestore = testDrawLayerRestore;
}
