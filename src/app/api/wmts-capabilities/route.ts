import { NextRequest, NextResponse } from "next/server";

interface WMTSCapabilitiesData {
	xml: string;
}

const capabilitiesCache = new Map<string, WMTSCapabilitiesData>();

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const url = searchParams.get("url");

	if (!url) {
		return NextResponse.json(
			{ error: "URL parameter required" },
			{ status: 400 },
		);
	}

	const cached = capabilitiesCache.get(url);
	if (cached) {
		return NextResponse.json(cached);
	}

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.status}`);
		}

		const text = await response.text();

		const cacheData = { xml: text };
		capabilitiesCache.set(url, cacheData);

		return NextResponse.json(cacheData);
	} catch (error) {
		return NextResponse.json(
			{ error: `Failed to fetch capabilities: ${error}` },
			{ status: 500 },
		);
	}
}
