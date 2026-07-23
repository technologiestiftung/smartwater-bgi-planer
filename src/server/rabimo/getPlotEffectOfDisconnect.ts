import "server-only";

import type { PlotType } from "@/server/rabimo/types";

export async function getPlotEffectOfDisconnect(
	runoffReduction: number,
	type: PlotType,
): Promise<Buffer> {
	const apiUrl = process.env.API_URL;
	if (!apiUrl) throw new Error("API_URL is not configured");

	const url = new URL(`${apiUrl.replace(/\/$/, "")}/plot_effect_of_disconnect`);
	url.searchParams.set("runoff_reduction", String(runoffReduction));
	url.searchParams.set("type", type);

	const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`BGI API error ${res.status}: ${text.slice(0, 500)}`);
	}
	return Buffer.from(await res.arrayBuffer());
}
