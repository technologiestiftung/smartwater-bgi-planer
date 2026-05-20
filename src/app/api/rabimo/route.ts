import { NextRequest, NextResponse } from "next/server";

import { getRabimo } from "@/server/rabimo/getRabimo";
import testPayload from "@/server/rabimo/test_payload.json";
import { isRabimoPayload } from "@/server/rabimo/types";

export async function GET() {
	try {
		const result = await getRabimo(testPayload);
		return NextResponse.json(result);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown Rabimo API error";

		return NextResponse.json({ error: message }, { status: 502 });
	}
}

export async function POST(request: NextRequest) {
	let body: unknown = testPayload;

	const contentLength = request.headers.get("content-length");
	if (contentLength && parseInt(contentLength) > 0) {
		try {
			body = await request.json();
		} catch {
			return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
		}
	}

	if (!isRabimoPayload(body)) {
		return NextResponse.json(
			{ error: "Invalid Rabimo payload format" },
			{ status: 400 },
		);
	}

	try {
		const result = await getRabimo(body);

		return NextResponse.json(result);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown Rabimo API error";

		return NextResponse.json({ error: message }, { status: 502 });
	}
}
