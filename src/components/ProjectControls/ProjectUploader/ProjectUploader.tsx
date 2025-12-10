"use client";

import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/map";
import { MapConfig } from "@/store/map/types";
import { useUiStore } from "@/store/ui";
import { CheckIcon, UploadIcon } from "@phosphor-icons/react";
import JSZip from "jszip";
import { FC, useCallback } from "react";

interface ProjectUploaderProps {}

const ProjectUploader: FC<ProjectUploaderProps> = ({}) => {
	const { setShowUploadAlert, uploadedFiles, setUploadedFiles } = useUiStore();
	const hasFiles = uploadedFiles.length > 0;

	const handleClick = useCallback(async () => {
		if (!hasFiles) {
			// Schritt 1: Zeige FileUploadZone
			setShowUploadAlert(true);
		} else {
			// Schritt 2: Importiere die ausgewählten Dateien
			await importSelectedFiles(uploadedFiles);
			// Reset nach erfolgreichem Import
			setUploadedFiles([]);
			setShowUploadAlert(false);
		}
	}, [hasFiles, setShowUploadAlert, uploadedFiles, setUploadedFiles]);

	return (
		<Button variant="outline" className="grow" onClick={handleClick}>
			{hasFiles ? (
				<>
					<CheckIcon className="mr-2" />
					<p>Ausgewählte Dateien importieren</p>
				</>
			) : (
				<>
					<UploadIcon className="mr-2" />
					<p>Dateien importieren</p>
				</>
			)}
		</Button>
	);
};

export default ProjectUploader;

// Export this function to be used by the FileUploadZone
// This only extracts files from zip and stores them, doesn't import yet
export const handleProjectFilesUpload = async (files: File[]) => {
	console.log("Files uploaded:", files);
	const { setUploadedFiles } = useUiStore.getState();
	const extractedFiles: File[] = [];

	for (const file of files) {
		console.log("[ProjectUploader] file::", file);

		if (file.name.endsWith(".zip")) {
			console.log("Extracting zip file:", file.name);
			const filesFromZip = await extractZipFile(file);
			extractedFiles.push(...filesFromZip);
		} else {
			// JSON files direkt hinzufügen
			extractedFiles.push(file);
		}
	}

	// Speichere die extrahierten Files im Store
	setUploadedFiles(extractedFiles);
};

// Extract files from zip (don't import yet)
const extractZipFile = async (file: File): Promise<File[]> => {
	try {
		const zip = new JSZip();
		const contents = await zip.loadAsync(file);
		const extractedFiles: File[] = [];

		// Extrahiere alle Dateien aus dem Zip
		for (const [filename, zipEntry] of Object.entries(contents.files)) {
			if (!zipEntry.dir) {
				const blob = await zipEntry.async("blob");
				const extractedFile = new File([blob], filename, {
					type: filename.endsWith(".json") ? "application/json" : blob.type,
				});
				extractedFiles.push(extractedFile);
			}
		}

		return extractedFiles;
	} catch (error) {
		console.error("Error extracting zip file:", error);
		return [];
	}
};

const isValidMapConfig = (obj: unknown): obj is MapConfig => {
	if (!obj || typeof obj !== "object") return false;

	const config = obj as Record<string, unknown>;

	return (
		config.portalConfig !== undefined &&
		typeof config.portalConfig === "object" &&
		config.layerConfig !== undefined &&
		typeof config.layerConfig === "object"
	);
};

const findConfigFile = async (files: File[]): Promise<File | null> => {
	for (const file of files) {
		if (!file.name.endsWith(".json")) continue;

		try {
			const text = await file.text();
			const parsed = JSON.parse(text);

			if (isValidMapConfig(parsed)) {
				console.log(`Found valid MapConfig in file: ${file.name}`);
				return file;
			}
		} catch {
			continue;
		}
	}

	return null;
};

// Import the selected files (called when user clicks "Ausgewählte Dateien importieren")
const importSelectedFiles = async (files: File[]) => {
	try {
		const configFile = await findConfigFile(files);

		if (!configFile) {
			console.error("No valid MapConfig found in files");
			return;
		}

		const configText = await configFile.text();
		const config = JSON.parse(configText) as MapConfig;

		loadNewConfig(config);
	} catch (error) {
		console.error("Error importing files:", error);
	}
};

const loadNewConfig = (config: MapConfig) => {
	const { setConfig, setShouldInitialize } = useMapStore.getState();

	console.log("[ProjectUploader] Loading new config:", config);

	setConfig(config);
	setShouldInitialize(true); // Trigger re-initialization
};
