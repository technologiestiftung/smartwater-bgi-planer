/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const wfsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for WFS (more dynamic data)

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

	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return NextResponse.json(cached.data);
	}

	try {
		const url = `${service}?service=WFS&version=1.1.0&request=GetFeature&typename=${typename}&outputFormat=application/json&srsname=${dataProjection}&bbox=${bbox},${featureProjection}`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`WFS request failed: ${response.status}`);
		}

		const data = await response.json();
		wfsCache.set(cacheKey, { data, timestamp: Date.now() });

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: `Failed to fetch WFS data: ${error}` },
			{ status: 500 },
		);
	}
}
