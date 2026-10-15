import { expect, test, type Page } from "@playwright/test";
import {
	EXPORT_ZIP,
	clickIfVisible,
	clickMapCenter,
	drawSquare,
	mockRabimo,
	runQuestions,
	seedTutorialOff,
	waitForMap,
} from "./helpers";

// Ein durchgehender Nutzerfluss: jeder Schritt baut auf dem Zustand des vorherigen auf.
test.describe.configure({ mode: "serial" });

let page: Page;
let projectId = "";
const btn = (name: string | RegExp, exact = typeof name === "string") =>
	page.getByRole("button", { name, exact });

test.beforeAll(async ({ browser }) => {
	page = await browser.newPage();
	await seedTutorialOff(page);
	if (process.env.RABIMO_MOCK) await mockRabimo(page);
});

test.afterAll(async () => {
	await page.close();
});

test("Projekt anlegen", async () => {
	await page.goto("/");
	await page.getByRole("link", { name: "Projekt anlegen" }).click();
	await expect(page).toHaveURL(/\/new$/);

	// Leerer Name → alert
	const alertMessage = new Promise<string>((resolve) =>
		page.once("dialog", async (dialog) => {
			resolve(dialog.message());
			await dialog.accept();
		}),
	);
	await btn("Änderungen Speichern").click();
	expect(await alertMessage).toContain("Projektnamen");

	await page.getByLabel("Projektname").fill("E2E Test");
	await page
		.getByLabel("Projektbeschreibung")
		.fill("Automatischer Playwright-Durchlauf");
	for (const label of [
		"Quartier",
		"Grundstück",
		"Straßen, Wege, Plätze / Grün- und Freiflächen",
		"individuelles Gebiet",
	]) {
		await page.getByRole("radio", { name: label }).check();
	}
	await btn("Änderungen Speichern").click();

	await expect(page).toHaveURL(/\/\d{8}_e2e-test\/project-starter/);
	projectId = new URL(page.url()).pathname.split("/")[1];
	await waitForMap(page);
});

test("Karten-Shell: Zoom, Baselayer, Layerbaum, Adresssuche", async () => {
	await btn("Zoom in").click();
	await btn("Zoom out").click();

	const switcher = btn(/alternate base layer/);
	await switcher.click();
	await switcher.hover();
	await page.getByLabel("Karte suchen").fill("a");
	const toggle = page
		.getByRole("button", { name: /^(Show|Hide) .* layer$/ })
		.first();
	await toggle.click();
	await toggle.click();
	const opacity = page.getByRole("slider", { name: /^Deckkraft/ }).first();
	if (await opacity.isVisible()) {
		await opacity.focus();
		await page.keyboard.press("ArrowLeft");
	}
	await page.getByLabel("Karte suchen").fill("");

	await btn("Toggle menu").click();
	await expect(page).toHaveURL(/\/menu$/);
	await page.goBack();

	// Adresssuche (echter photon-Server über Server Action) – zentriert die Karte
	const search = page.getByRole("combobox", { name: "Adresse suchen" });
	// photon (extern) ist manchmal nicht erreichbar und die App verschluckt Fehler →
	// wiederholen; bleibt es leer, nur warnen statt den ganzen Durchlauf abzubrechen
	try {
		await expect(async () => {
			await search.fill("");
			await search.fill("Alexanderplatz");
			await expect(page.getByRole("option").first()).toBeVisible({
				timeout: 5_000,
			});
		}).toPass({ timeout: 30_000 });
		await page.getByRole("option").first().click();
		await page.waitForTimeout(1500);
	} catch {
		test.info().annotations.push({
			type: "warning",
			description:
				"photon.komoot.io lieferte keine Treffer – Adresssuche übersprungen",
		});
	}
	await btn("Clear search").click();
	await expect(search).toHaveValue("");
	await btn("Projekt Layer").click();
});

test("Project-Starter: Projektgebiet, Neubauten, Zusatzkarten", async () => {
	// Schritt 1: Projektgebiet
	const drawBoundary = btn("Fläche zeichnen");
	await expect(drawBoundary).toBeEnabled({ timeout: 60_000 });
	await drawBoundary.click();
	await drawSquare(page, 120);
	await expect(page.getByText("Blockteilflächen laden...")).toBeHidden({
		timeout: 60_000,
	});
	await clickIfVisible(btn("Stop bearbeiten"));
	const confirm = btn("Bestätigen");
	await expect(confirm).toBeEnabled({ timeout: 60_000 });
	await confirm.click();

	const stored = await page.evaluate(() =>
		localStorage.getItem("project-storage"),
	);
	expect(
		JSON.parse(stored!).state.project.inputFeatures?.length ?? 1,
	).toBeGreaterThan(0);

	// Schritt 2: Neubauten
	await btn("Neubauten und Versiegelte Flächen anlegen").click();
	await btn("Zeichnen").click();
	await drawSquare(page, 30, { x: -40, y: -40 });
	await btn("Stop Zeichnen").click();
	await btn("Bestätigen").click();

	// Schritt 3: Zusatzkarten
	await btn("Zusatzkarten").click();
	await page
		.locator('input[type=file][accept*=".geojson"]')
		.first()
		.setInputFiles({
			name: "e2e.geojson",
			mimeType: "application/geo+json",
			buffer: Buffer.from(
				JSON.stringify({
					type: "FeatureCollection",
					features: [
						{
							type: "Feature",
							properties: { name: "e2e" },
							geometry: { type: "Point", coordinates: [13.4132, 52.5219] },
						},
					],
				}),
			),
		});
	const deleteLayer = page.getByTitle("Layer löschen");
	await expect(deleteLayer).toHaveCount(1);

	// WMS einbinden: Abbrechen, dann echten Dienst (gdi.berlin.de) mit erstem Layer
	await btn("WMS einbinden").click();
	await btn("Abbrechen").click();
	await btn("WMS einbinden").click();
	await page
		.locator("#wms-url")
		.fill(
			"https://gdi.berlin.de/services/wms/so_bofplhi2020?SERVICE=WMS&REQUEST=GetCapabilities",
		);
	const firstLayer = page.getByRole("dialog").getByRole("checkbox").first();
	await expect(firstLayer).toBeVisible({ timeout: 30_000 });
	await firstLayer.check();
	await btn("Layer hinzufügen").click();
	await expect(page.getByRole("dialog")).toBeHidden({ timeout: 30_000 });
	// Erster Eintrag ist eine Layergruppe → kann mehrere Layer hinzufügen
	await expect.poll(() => deleteLayer.count()).toBeGreaterThan(1);

	// Alle hochgeladenen Layer wieder löschen
	while ((await deleteLayer.count()) > 0) {
		const n = await deleteLayer.count();
		await deleteLayer.first().click();
		await expect(deleteLayer).toHaveCount(n - 1);
	}

	await btn("Abschließen").click();
	await expect(page).toHaveURL(/\/menu$/);
});

test("Menü: Projektinformationen bearbeiten, Löschen abbrechen", async () => {
	await page.getByRole("link", { name: "Projektinformationen" }).click();
	await expect(page).toHaveURL(/\/edit$/);
	await page.getByLabel("Projektbeschreibung").fill("Geänderte Beschreibung");

	await btn("Projekt löschen").click();
	await btn("Nicht löschen").click();

	await btn("Änderungen Speichern").click();
	await page.goto(`/${projectId}/menu`);
	await expect(page.getByText("Geänderte Beschreibung")).toBeVisible();

	await page.locator(`a[href="/${projectId}/handlungsbedarfe"]`).click();
	await expect(page).toHaveURL(/\/handlungsbedarfe/);
});

test("Modul 1: Handlungsbedarfe", async () => {
	await waitForMap(page);
	await btn("Modul 1 anfangen").click();
	await btn("Checkfragen starten").click();

	// Tutorial-Button gibt es nur bei Fragen mit Zeichenfunktion
	if (await btn("Show tutorial").isVisible()) {
		await btn("Show tutorial").click();
		await expect(btn("Hide tutorial")).toBeVisible();
		await page.mouse.click(5, 450); // Klick auf den Hintergrund schließt es
	}
	await runQuestions(page);

	// Synthese-Ansicht
	const eye = page
		.getByRole("button", { name: /Alle Layer (ein|aus)blenden/ })
		.first();
	await eye.click();
	await eye.click();
	const badgeToggle = page.locator("button[aria-pressed]").first();
	await badgeToggle.click();
	await badgeToggle.click();

	await btn("zu den Checkfragen").click();
	await btn("Zusammenfassung anzeigen").click();
	await btn("zu Modul 2").click();
	await expect(page).toHaveURL(/\/machbarkeit/);
});

test("Modul 2: Machbarkeit inkl. Notiz", async () => {
	await waitForMap(page);
	await btn("Modul 2 anfangen").click();

	// Notiz setzen und wieder löschen (auf der ersten Frage mit Notiz-Funktion)
	if (await btn("Notiz").isVisible()) {
		await btn("Notiz").click();
		await clickMapCenter(page);
		await page.getByRole("textbox").last().fill("E2E Notiz");
		await btn("Speichern").click();
		await clickMapCenter(page);
		await btn("Löschen").click();
	}

	await runQuestions(page);
	await btn("zu Modul 3").click();
	await expect(page).toHaveURL(/\/planung/);
});

test("Modul 3: Maßnahmen planen und Effektbewertung", async () => {
	test.setTimeout(300_000); // alle Maßnahmen nacheinander zeichnen
	await waitForMap(page);

	// Maßnahmenkatalog über Info-Link
	await btn("Gebäudebegrünung").click();
	await page
		.getByRole("link", { name: "Informationen zu Extensive Dachbegrünung" })
		.click();
	await expect(page).toHaveURL(/info=/);
	await expect(
		page.getByRole("dialog", { name: "Maßnahmenkatalog" }),
	).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(
		page.getByRole("dialog", { name: "Maßnahmenkatalog" }),
	).toBeHidden();

	// Schließen des Katalogs klappt das Akkordeon verzögert zu, sobald ?info=
	// aus der URL verschwindet
	await expect(page).not.toHaveURL(/info=/);
	await expect(btn("Gebäudebegrünung")).toHaveAttribute(
		"aria-expanded",
		/true|false/,
	);

	const openSection = async (name: string) => {
		const section = btn(name);
		if ((await section.getAttribute("aria-expanded")) !== "true") {
			await section.click();
		}
	};
	const confirm = async () => {
		const button = btn("Bestätigen");
		await expect(button).toBeEnabled();
		await button.click();
		// Bestätigen führt zurück zur Maßnahmenliste
		await expect(button).toBeHidden();
	};
	const drawPolygon = async () => {
		await btn("Maßnahme zeichnen").click();
		await drawSquare(page, 10);
	};
	const placeTree = async () => {
		await btn("Kleiner Baum").click();
		await clickMapCenter(page);
	};

	// Alle Maßnahmen aus modules.json (Modul 3) einmal anlegen
	const sections: [string, [string, () => Promise<void>][]][] = [
		[
			"Gebäudebegrünung",
			[
				["Extensive Dachbegrünung", drawPolygon],
				["Intensive Dachbegrünung", drawPolygon],
				["Bodengebundene Fassadenbegrünung", drawPolygon],
			],
		],
		[
			"Entsiegelung / Vermeidung von Versiegelung",
			[
				["Teildurchlässiger Flächenbelag", drawPolygon],
				["Vollständige Entsiegelung", drawPolygon],
			],
		],
		[
			"Begrünung / Bepflanzung",
			[
				["Grünflächen", drawPolygon],
				["Baumstandort", placeTree],
			],
		],
		[
			"Versickerung",
			[
				["Mulde", drawPolygon],
				["Flächenversickerung", drawPolygon],
				["Mulden-Rigolen-Element", drawPolygon],
				["Tiefbeet", drawPolygon],
				[
					"Optimierter Baumstandort (Baum mit unterirdischer Versickerung kombiniert)",
					async () => {
						// Auswahl der anzuschließenden Fläche greift hier nicht automatisch
						// → per Klick auf die Karte auswählen. Die Select-Interaktion hängt die App
						// verzögert an, daher den Klick wiederholen, bis die Baum-Buttons aktiv sind.
						await expect(async () => {
							await clickMapCenter(page);
							await expect(btn("Kleiner Baum")).toBeEnabled({ timeout: 2_000 });
						}).toPass({ timeout: 30_000 });
						await placeTree();
						await btn("Fertig").click();
					},
				],
				["Rigole", drawPolygon],
			],
		],
		[
			"Speicherung und Überflutungsvorsorge",
			[
				["(Künstliche) Wasserflächen", drawPolygon],
				["Regenwasserspeicher", drawPolygon],
				["Retentionsfläche", drawPolygon],
				["Verdunstungsbeet", drawPolygon],
			],
		],
	];

	for (const [section, measures] of sections) {
		for (const [measure, draw] of measures) {
			// page wird nur in beforeAll gesetzt, die Schleife ist seriell
			// eslint-disable-next-line no-loop-func
			await test.step(measure, async () => {
				// Versickerung: jede Maßnahme verbraucht eine eigene anzuschließende Fläche
				if (section === "Versickerung") {
					await openSection(section);
					await btn("Anzuschließende Fläche zeichnen").click();
					await btn("Anzuschließende Fläche zeichnen").click();
					await drawSquare(page, 20);
					await confirm();
				}
				await openSection(section);
				await btn(measure).click();
				await draw();
				await confirm();
			});
		}
	}

	// Effektbewertung → echte Rabimo-Abfrage (bzw. Mock bei RABIMO_MOCK=1)
	const rabimoResponse = page.waitForResponse(
		(r) =>
			new URL(r.url()).pathname === "/api/rabimo" &&
			r.request().method() === "POST",
		{ timeout: 60_000 },
	);
	await btn("Zusammenfassung anzeigen").click();
	await expect(
		page.getByRole("heading", { name: "Effektbewertung" }),
	).toBeVisible();
	const res = await rabimoResponse;
	const req = res.request().postDataJSON();
	expect(req.blocks.length).toBeGreaterThan(0);
	// measures ist pro Blockteilfläche aggregiert → jedes Rabimo-Feld muss befüllt sein
	// (3G5, 3B1, 3S1, 3S4, 3S5 haben kein Rabimo-Feld)
	for (const key of [
		"green_roof_ext",
		"green_roof_int",
		"permeable_paving",
		"unpaving",
		"trees_sm",
		"to_swale",
		"to_surf_infil",
		"to_swale_trench",
		"to_tree_pit",
		"to_trench",
		"to_cistern",
	]) {
		const sum = req.measures.reduce(
			(acc: number, m: Record<string, number>) => acc + m[key],
			0,
		);
		expect(sum, key).toBeGreaterThan(0);
	}
	expect(res.status()).toBe(200);
	expect((await res.json()).statistics).toBeDefined();
	await expect(
		page.getByText("Effektbewertung konnte nicht geladen werden."),
	).toBeHidden();

	await btn("Zu den Maßnahmen").click();
	await expect(btn("Gebäudebegrünung")).toBeVisible();
});

test("Export und Report-Dialog", async () => {
	await page.goto(`/${projectId}/menu`);

	const download = page.waitForEvent("download");
	await btn("Download und speichern").click();
	const file = await download;
	expect(file.suggestedFilename()).toMatch(/\.zip$/);
	await file.saveAs(EXPORT_ZIP);

	// Nur Dialog prüfen: PDF braucht Gotenberg
	await btn("Gesamter Report").click();
	await expect(btn("Word (.docx)")).toBeVisible();
	await page.keyboard.press("Escape");
});
