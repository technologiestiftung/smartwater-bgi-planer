"use server";

import shp from "shpjs";

export async function convertShapefile(formData: FormData) {
	try {
		const file = formData.get("file") as File;

		if (!file) {
			throw new Error("No file provided");
		}

		if (
			!file.name.toLowerCase().endsWith(".zip") &&
			!file.name.toLowerCase().endsWith(".shp")
		) {
			throw new Error(
				"Invalid file type. Please upload a ZIP file containing shapefiles or a .shp file.",
			);
		}

		const maxSize = 50 * 1024 * 1024;
		if (file.size > maxSize) {
			throw new Error("File too large. Maximum size is 50MB.");
		}

		const arrayBuffer = await file.arrayBuffer();

		if (arrayBuffer.byteLength === 0) {
			throw new Error("Empty file provided");
		}

		const geojson = await shp(arrayBuffer);

		if (!geojson) {
			throw new Error(
				"Failed to convert shapefile. The file may be corrupted or invalid.",
			);
		}

		return geojson;
	} catch (error) {
		console.error("Shapefile conversion error:", error);

		if (error instanceof Error) {
			if (error.message.includes("zip") || error.message.includes("ZIP")) {
				throw new Error("Invalid ZIP file or corrupted shapefile archive");
			}

			if (
				error.message.includes("shapefile") ||
				error.message.includes("dbf")
			) {
				throw new Error(
					"Invalid shapefile format. Please ensure all required files (.shp, .shx, .dbf) are included.",
				);
			}
		}

		throw new Error("Internal server error occurred while processing the file");
	}
}
