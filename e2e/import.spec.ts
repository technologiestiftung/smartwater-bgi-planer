import { expect, test, type FileChooser, type Page } from "@playwright/test";
import fs from "node:fs";
import { EXPORT_ZIP, seedTutorialOff } from "./helpers";

test.beforeEach(async ({ page }) => {
	await seedTutorialOff(page);
	await page.goto("/");
});

async function chooseFile(
	page: Page,
	file: Parameters<FileChooser["setFiles"]>[0],
) {
	// Dropzone erscheint erst nach Klick auf "Datei hochladen"
	await page.getByRole("button", { name: "Datei hochladen" }).click();
	const chooser = page.waitForEvent("filechooser");
	await page.getByRole("button", { name: "Projektdatei hochladen" }).click();
	await (await chooser).setFiles(file);
}

test("ungültige Datei wird abgelehnt", async ({ page }) => {
	await chooseFile(page, {
		name: "kaputt.zip",
		mimeType: "application/zip",
		buffer: Buffer.from("kein zip"),
	});
	const importBtn = page.getByRole("button", { name: "Projekt importieren" });
	if (await importBtn.isVisible()) await importBtn.click();
	await expect(page.getByText(/nicht kompatibel/)).toBeVisible();
});

test("exportiertes Projekt importieren", async ({ page }) => {
	test.skip(
		!fs.existsSync(EXPORT_ZIP),
		"Walkthrough hat keine Export-ZIP erzeugt",
	);
	await chooseFile(page, EXPORT_ZIP);
	await page.getByRole("button", { name: "Projekt importieren" }).click();
	await expect(page).toHaveURL(/\/\d{8}_e2e-test/);
});
