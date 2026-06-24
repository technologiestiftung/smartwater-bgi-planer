import { getRabimo } from "@/server/rabimo/getRabimo";
import { RabimoPayload } from "@/server/rabimo/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	let body: RabimoPayload;

	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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
