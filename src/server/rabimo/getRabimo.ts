import "server-only";

import { RabimoPayload } from "@/server/rabimo/types";
import https from "https";

/**
 * Calls the external Rabimo API and returns the parsed JSON response.
 */
export async function getRabimo(payload: RabimoPayload) {
	const apiUrl = process.env.API_URL;

	if (!apiUrl) {
		throw new Error("API_URL is not configured");
	}

	const isHttps = apiUrl.startsWith("https");

	return new Promise((resolve, reject) => {
		const url = new URL(apiUrl);
		const basePath = url.pathname || "";
		const path = `${basePath}/calculate_multiblock`;

		const options = {
			hostname: url.hostname,
			port: url.port,
			path,
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			...(isHttps && { rejectUnauthorized: false }),
		};

		const req = https.request(options, (res) => {
			let data = "";
			res.on("data", (chunk) => {
				data += chunk;
			});
			res.on("end", () => {
				if (!res.statusCode || res.statusCode >= 400) {
					reject(new Error(`BGI API error ${res.statusCode}: ${data}`));
				} else {
					resolve(JSON.parse(data));
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
