import { getPlotEffectOfDisconnect } from "@/server/rabimo/getPlotEffectOfDisconnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const runoffReduction = searchParams.get("runoff_reduction");
	const type = searchParams.get("type");

	if (!runoffReduction || !type) {
		return NextResponse.json(
			{ error: "'runoff_reduction' and 'type' query params are required" },
			{ status: 400 },
		);
	}

	try {
		const buffer = await getPlotEffectOfDisconnect(
			Number(runoffReduction),
			type,
		);
		return new NextResponse(new Uint8Array(buffer), {
			headers: { "Content-Type": "image/png" },
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown Rabimo API error";

		return NextResponse.json({ error: message }, { status: 502 });
	}
}
