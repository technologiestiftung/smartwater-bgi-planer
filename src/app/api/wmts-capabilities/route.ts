/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

// In-memory cache (use Redis in production)
const capabilitiesCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const url = searchParams.get("url");

	if (!url) {
		return NextResponse.json(
			{ error: "URL parameter required" },
			{ status: 400 },
		);
	}

	// Check cache first
	const cached = capabilitiesCache.get(url);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return NextResponse.json(cached.data);
	}

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.status}`);
		}

		const text = await response.text();

		// Cache the raw XML text (parsing still happens client-side for OpenLayers)
		const cacheData = { xml: text };
		capabilitiesCache.set(url, { data: cacheData, timestamp: Date.now() });

		return NextResponse.json(cacheData);
	} catch (error) {
		return NextResponse.json(
			{ error: `Failed to fetch capabilities: ${error}` },
			{ status: 500 },
		);
	}
}
