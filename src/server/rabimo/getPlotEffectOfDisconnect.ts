import "server-only";

import http from "http";
import https from "https";

/**
 * Calls the external Rabimo API and returns the plot as a PNG buffer.
 */
export async function getPlotEffectOfDisconnect(
	runoffReduction: number,
	type: string,
): Promise<Buffer> {
	const apiUrl = process.env.API_URL;

	if (!apiUrl) {
		throw new Error("API_URL is not configured");
	}

	const url = new URL(apiUrl);
	const isHttps = url.protocol === "https:";
	const transport = isHttps ? https : http;

	const basePath = url.pathname.replace(/\/$/, "");
	const query = new URLSearchParams({
		runoff_reduction: String(runoffReduction),
		type,
	});
	const path = `${basePath}/plot_effect_of_disconnect?${query.toString()}`;

	return new Promise((resolve, reject) => {
		const options = {
			hostname: url.hostname,
			port: url.port,
			path,
			method: "GET",
			...(isHttps && {
				rejectUnauthorized: process.env.NODE_ENV === "production",
			}),
		};

		const req = transport.request(options, (res) => {
			const chunks: Buffer[] = [];
			res.on("data", (chunk) => {
				chunks.push(chunk);
			});
			res.on("end", () => {
				const buffer = Buffer.concat(chunks);
				if (!res.statusCode || res.statusCode >= 400) {
					reject(
						new Error(
							`BGI API error ${res.statusCode}: ${buffer.toString("utf-8").slice(0, 500)}`,
						),
					);
					return;
				}
				resolve(buffer);
			});
		});

		req.on("error", (error) => {
			reject(error);
		});

		req.end();
	});
}
