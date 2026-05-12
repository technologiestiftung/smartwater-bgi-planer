import "server-only";

import { RabimoPayload } from "@/server/rabimo/types";
import http from "http";
import https from "https";

/**
 * Calls the external Rabimo API and returns the parsed JSON response.
 */
export async function getRabimo(payload: RabimoPayload) {
	const apiUrl = process.env.API_URL;

	if (!apiUrl) {
		throw new Error("API_URL is not configured");
	}

	const url = new URL(apiUrl);
	const isHttps = url.protocol === "https:";
	const isDev = process.env.NODE_ENV !== "production";
	const transport = isHttps ? https : http;

	const basePath = url.pathname.replace(/\/$/, "");
	const path = `${basePath}/calculate_multiblock`;

	return new Promise((resolve, reject) => {
		const options = {
			hostname: url.hostname,
			port: url.port,
			path,
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			...(isHttps && isDev && { rejectUnauthorized: false }),
		};

		const req = transport.request(options, (res) => {
			let data = "";
			res.on("data", (chunk) => {
				data += chunk;
			});
			res.on("end", () => {
				if (!res.statusCode || res.statusCode >= 400) {
					reject(
						new Error(`BGI API error ${res.statusCode}: ${data.slice(0, 500)}`),
					);
					return;
				}
				try {
					resolve(JSON.parse(data));
				} catch {
					reject(
						new Error(
							`BGI API returned invalid JSON (status ${res.statusCode}): ${data.slice(0, 500)}`,
						),
					);
				}
			});
		});

		req.on("error", (error) => {
			reject(error);
		});

		req.write(JSON.stringify(payload));
		req.end();
	});
}
