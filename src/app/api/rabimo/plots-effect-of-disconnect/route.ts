import { getPlotEffectOfDisconnect } from "@/server/rabimo/getPlotEffectOfDisconnect";
import { PLOT_TYPES, PlotType } from "@/server/rabimo/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const runoffReduction = request.nextUrl.searchParams.get("runoff_reduction");

	if (!runoffReduction) {
		return NextResponse.json(
			{ error: "'runoff_reduction' query param is required" },
			{ status: 400 },
		);
	}

	const results = await Promise.allSettled(
		PLOT_TYPES.map(async (type) => {
			const buffer = await getPlotEffectOfDisconnect(
				Number(runoffReduction),
				type,
			);
			return { type, data: buffer.toString("base64") };
		}),
	);

	const plots: Partial<Record<PlotType, string>> = {};
	for (const result of results) {
		if (result.status === "fulfilled") {
			plots[result.value.type] = result.value.data;
		}
	}

	return NextResponse.json(plots);
}
