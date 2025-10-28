import { NextRequest, NextResponse } from "next/server";
import shp from "shpjs";

export const POST = async (req: NextRequest) => {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		if (
			!file.name.toLowerCase().endsWith(".zip") &&
			!file.name.toLowerCase().endsWith(".shp")
		) {
			return NextResponse.json(
				{
					error:
						"Invalid file type. Please upload a ZIP file containing shapefiles or a .shp file.",
				},
				{ status: 400 },
			);
		}

		const maxSize = 50 * 1024 * 1024;
		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: "File too large. Maximum size is 50MB." },
				{ status: 413 },
			);
		}

		const arrayBuffer = await file.arrayBuffer();

		if (arrayBuffer.byteLength === 0) {
			return NextResponse.json(
				{ error: "Empty file provided" },
				{ status: 400 },
			);
		}

		const geojson = await shp(arrayBuffer);

		if (!geojson) {
			return NextResponse.json(
				{
					error:
						"Failed to convert shapefile. The file may be corrupted or invalid.",
				},
				{ status: 422 },
			);
		}

		return NextResponse.json(geojson);
	} catch (error) {
		console.error("Shapefile conversion error:", error);

		if (error instanceof Error) {
			if (error.message.includes("zip") || error.message.includes("ZIP")) {
				return NextResponse.json(
					{ error: "Invalid ZIP file or corrupted shapefile archive" },
					{ status: 422 },
				);
			}

			if (
				error.message.includes("shapefile") ||
				error.message.includes("dbf")
			) {
				return NextResponse.json(
					{
						error:
							"Invalid shapefile format. Please ensure all required files (.shp, .shx, .dbf) are included.",
					},
					{ status: 422 },
				);
			}
		}

		return NextResponse.json(
			{ error: "Internal server error occurred while processing the file" },
			{ status: 500 },
		);
	}
};
