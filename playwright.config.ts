import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "e2e",
	timeout: 90_000,
	expect: { timeout: 20_000 },
	retries: 1,
	workers: 1,
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		browserName: "chromium",
		baseURL: process.env.BASE_URL ?? "http://localhost:3000",
		viewport: { width: 1440, height: 900 },
		trace: "on-first-retry",
		acceptDownloads: true,
	},
	// Startet `npm run dev`, falls die App nicht schon läuft
	webServer: process.env.BASE_URL
		? undefined
		: {
				command: "npm run dev",
				url: "http://localhost:3000",
				reuseExistingServer: true,
				timeout: 120_000,
			},
	projects: [
		{ name: "walkthrough", testMatch: /walkthrough\.spec\.ts/ },
		{
			name: "import",
			testMatch: /import\.spec\.ts/,
			dependencies: ["walkthrough"],
		},
	],
});
