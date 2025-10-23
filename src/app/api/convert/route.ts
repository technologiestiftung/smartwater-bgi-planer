import { NextRequest, NextResponse } from "next/server";
import shp from "shpjs";

export const POST = async (req: NextRequest) => {
	const formData = await req.formData();
	const file = formData.get("file") as File;
	const arrayBuffer = await file.arrayBuffer();
	const geojson = await shp(arrayBuffer);

	return NextResponse.json(geojson);
};
