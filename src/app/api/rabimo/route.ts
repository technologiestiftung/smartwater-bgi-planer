import { getRabimo } from "@/server/rabimo/getRabimo";
import { isValidRabimoPayload } from "@/server/rabimo/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	if (!isValidRabimoPayload(body)) {
		return NextResponse.json(
			{ error: "Invalid payload: 'blocks' and 'measures' arrays are required" },
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
