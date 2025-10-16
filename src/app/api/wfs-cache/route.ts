import type { FeatureCollection } from "geojson";
import { NextRequest, NextResponse } from "next/server";

const wfsCache = new Map<string, FeatureCollection>();

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const service = searchParams.get("service");
	const typename = searchParams.get("typename");
	const bbox = searchParams.get("bbox");
	const dataProjection = searchParams.get("dataProjection") || "EPSG:25833";
	const featureProjection =
		searchParams.get("featureProjection") || "EPSG:3857";

	if (!service || !typename || !bbox) {
		return NextResponse.json(
			{ error: "Missing required parameters" },
			{ status: 400 },
		);
	}

	const cacheKey = `${service}:${typename}:${bbox}:${dataProjection}:${featureProjection}`;
	const cached = wfsCache.get(cacheKey);

	if (cached) {
		return NextResponse.json(cached);
	}

	try {
		const url = `${service}?service=WFS&version=1.1.0&request=GetFeature&typename=${typename}&outputFormat=application/json&srsname=${dataProjection}&bbox=${bbox},${featureProjection}`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`WFS request failed: ${response.status}`);
		}

		const data = await response.json();
		wfsCache.set(cacheKey, data);

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: `Failed to fetch WFS data: ${error}` },
			{ status: 500 },
		);
	}
}
