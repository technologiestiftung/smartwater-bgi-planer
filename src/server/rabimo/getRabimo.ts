import "server-only";

import type { RabimoPayload } from "@/server/rabimo/types";

/**
 * Calls the external Rabimo API and returns the parsed JSON response.
 */
export async function getRabimo(payload: RabimoPayload) {
	const apiUrl = process.env.API_URL;
	if (!apiUrl) throw new Error("API_URL is not configured");

	const url = new URL(`${apiUrl.replace(/\/$/, "")}/calculate_multiblock`);

	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
		signal: AbortSignal.timeout(10_000),
	});

	const text = await res.text();

	if (!res.ok) {
		throw new Error(`BGI API error ${res.status}: ${text.slice(0, 500)}`);
	}

	try {
		return JSON.parse(text);
	} catch {
		throw new Error(
			`BGI API returned invalid JSON (status ${res.status}): ${text.slice(0, 500)}`,
		);
	}
}
