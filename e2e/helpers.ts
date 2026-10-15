import { expect, type Locator, type Page } from "@playwright/test";
import rabimo from "./fixtures/rabimo.json";

export const EXPORT_ZIP = "test-results/export.zip";

// 1x1 transparentes PNG
const PNG =
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export async function seedTutorialOff(page: Page) {
	await page.addInitScript(() => {
		localStorage.setItem(
			"tutorial-storage",
			JSON.stringify({
				state: {
					showTutorialOnFirstQuestion: false,
					showTutorialOnFirstMeasureDraw: false,
				},
				version: 0,
			}),
		);
	});
}

export async function waitForMap(page: Page) {
	await expect(page.getByText("Karte wird geladen...")).toBeHidden({
		timeout: 60_000,
	});
	await expect(page.getByText("Fehler beim Laden der Karte")).toBeHidden();
}

/** Nur bei RABIMO_MOCK=1: ersetzt die echte Rabimo-API durch e2e/fixtures/rabimo.json. */
export async function mockRabimo(page: Page) {
	await page.route("**/api/rabimo/plot-effect-of-disconnect*", (route) =>
		route.fulfill({ json: { critical_hours: PNG, critical_events: PNG } }),
	);
	await page.route("**/api/rabimo", async (route) => {
		await route.fulfill({ json: rabimo });
	});
}

async function canvasCenter(page: Page) {
	const box = await page.locator("div.map canvas").first().boundingBox();
	if (!box) throw new Error("Karten-Canvas nicht gefunden");
	return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/**
 * Zeichnet ein Quadrat um die Kartenmitte (Kantenlänge 2*r px) und schließt es durch
 * Klick auf den ersten Punkt – funktioniert für normales Draw und für useDrawMeasure.
 */
export async function drawSquare(page: Page, r = 80, offset = { x: 0, y: 0 }) {
	const c = await canvasCenter(page);
	const cx = c.x + offset.x;
	const cy = c.y + offset.y;
	const pts = [
		[cx - r, cy - r],
		[cx + r, cy - r],
		[cx + r, cy + r],
		[cx - r, cy + r],
		[cx - r, cy - r],
	];
	for (const [x, y] of pts) {
		await page.mouse.click(x, y);
		await page.waitForTimeout(150);
	}
}

export async function clickMapCenter(page: Page) {
	const c = await canvasCenter(page);
	await page.mouse.click(c.x, c.y);
}

export async function clickIfVisible(locator: Locator) {
	if (await locator.first().isVisible()) {
		await locator.first().click();
		return true;
	}
	return false;
}

/**
 * Beantwortet die erste(n) Fragen auf verschiedene Arten und überspringt den Rest,
 * bis "Abschließen" erscheint. Unabhängig von der Fragenreihenfolge in modules.json.
 */
export async function runQuestions(page: Page) {
	const footer = (name: string) =>
		page.getByRole("button", { name, exact: true });

	// Letzte h4 = Titel der aktuellen Frage (davor steht der Modultitel)
	const question = page.getByRole("heading", { level: 4 }).last();

	// Jeder Themenblock beginnt mit einer Intro-Seite. Die App wechselt nach einer
	// Antwort teils verzögert (setTimeout) → warten, bis die Frage gewechselt hat,
	// sonst landen spätere Klicks auf der nächsten Frage.
	const answer = async (name: string) => {
		await clickIfVisible(
			page.getByRole("button", { name: "Checkfragen starten" }),
		);
		const before = await question.textContent();
		await page.getByRole("button", { name }).click();
		await expect(question).not.toHaveText(before ?? "");
	};
	await answer("Überall zutreffend");
	await answer("Nicht zutreffend");

	// Eine Frage mit Zeichnen beantworten, sobald eine kommt (max. 10 Fragen suchen)
	for (let i = 0; i < 10; i++) {
		const draw = page.getByRole("button", { name: "Zeichnen", exact: true });
		if (await draw.isVisible()) {
			await draw.click();
			await drawSquare(page, 40);
			await clickIfVisible(page.getByRole("button", { name: "Stop Zeichnen" }));
			const confirm = page.getByRole("button", { name: "Auswahl bestätigen" });
			await expect(confirm).toBeEnabled();
			await confirm.click();
			break;
		}
		if (await footer("Abschließen").isVisible()) break;
		await footer("Überspringen").click();
	}

	for (let i = 0; i < 60 && !(await footer("Abschließen").isVisible()); i++) {
		// Machbarkeit 2V1: Szenario-Buttons
		for (const name of [
			"einfache Umsetzung",
			"gängige Praxis",
			"aufwendige Umsetzung",
		]) {
			await clickIfVisible(page.getByRole("button", { name }));
		}
		await footer("Überspringen").click();
	}
	await footer("Abschließen").click();
}
