import Docxtemplater from "docxtemplater";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";
import PizZip from "pizzip";

// ---------- body types ----------
interface SummaryEntry {
	total_area_m2: number;
	runoff: number;
	infiltr: number;
	evapor: number;
	delta: number;
}

interface ReportBody {
	project: {
		id: string;
		name: string;
		description: string;
		useCase: string;
		createdAt: number;
		updatedAt: number;
	} | null;
	accumulatedStats: {
		totalArea: number;
		inputFeaturesCount: number;
		areaPotential: Record<string, number>;
		computedArea: Record<string, number>;
	} | null;
	activeScenario: {
		id: string;
		name: string;
		measures: Array<{
			id: string;
			name: string;
			area: number;
			code: string | null;
			configId: string;
		}>;
		connectedAreas: Array<{ id: string; area: number }>;
	} | null;
	result: { data: Record<string, unknown> } | null;
	datum: string;
}

// ---------- helpers ----------

const USE_CASE_LABELS: Record<string, string> = {
	"Individual area": "Einzelfläche",
	District: "Quartier",
	Property: "Grundstück",
	"Streets, paths, squares / green spaces":
		"Straßen, Wege, Plätze / Grünflächen",
};

// eslint-disable-next-line complexity
function buildProjectFields(body: ReportBody) {
	const { project, datum } = body;
	return {
		project_name: project?.name ?? "",
		description: project?.description ?? "",
		use_case: USE_CASE_LABELS[project?.useCase ?? ""] ?? project?.useCase ?? "",
		created_at: project?.createdAt
			? new Date(project.createdAt).toLocaleDateString("de-DE")
			: "",
		date: datum ?? new Date().toLocaleDateString("de-DE"),
	};
}

// eslint-disable-next-line complexity
function buildAreaFields(stats: ReportBody["accumulatedStats"]) {
	const p = stats?.areaPotential;
	const c = stats?.computedArea;
	return {
		total_area_m2: stats?.totalArea ?? 0,
		area_count: stats?.inputFeaturesCount ?? 0,
		potential_green_roof_ext: p?.green_roof_ext ?? 0,
		potential_green_roof_int: p?.green_roof_int ?? 0,
		potential_unpaving: p?.unpaving ?? 0,
		potential_permeable_paving: p?.permeable_paving ?? 0,
		potential_to_swale: p?.to_swale ?? 0,
		potential_to_swale_trench: p?.to_swale_trench ?? 0,
		potential_to_trench: p?.to_trench ?? 0,
		potential_to_cistern: p?.to_cistern ?? 0,
		potential_to_surf_infil: p?.to_surf_infil ?? 0,
		potential_to_tree_pit: p?.to_tree_pit ?? 0,
		area_total_m2: c?.total ?? 0,
		area_roof_m2: c?.roof ?? 0,
		area_pvd_m2: c?.pvd ?? 0,
		area_sealed_m2: c?.sealed ?? 0,
		area_unsealed_m2: c?.unsealed ?? 0,
	};
}

function buildScenarioFields(scenario: ReportBody["activeScenario"]) {
	return {
		scenario_name: scenario?.name ?? "",
		measure_count: scenario?.measures?.length ?? 0,
		measures: (scenario?.measures ?? []).map((m) => ({
			measure_name: m.name,
			measure_area_m2: m.area,
			measure_code: m.code ?? "",
		})),
	};
}

// eslint-disable-next-line complexity
function buildResultFields(result: ReportBody["result"]) {
	const data = result?.data as {
		summary?: { original?: SummaryEntry; with_measures?: SummaryEntry };
		statistics?: { runoff_reduction_percent?: number | number[] };
	} | null;

	const summary = data?.summary;
	const raw = data?.statistics?.runoff_reduction_percent;
	const runoffReduction = Array.isArray(raw) ? raw[0] : raw;

	return {
		has_result: result !== null,
		original_runoff: summary?.original?.runoff ?? 0,
		original_infiltr: summary?.original?.infiltr ?? 0,
		original_evapor: summary?.original?.evapor ?? 0,
		original_delta: summary?.original?.delta ?? 0,
		measures_runoff: summary?.with_measures?.runoff ?? 0,
		measures_infiltr: summary?.with_measures?.infiltr ?? 0,
		measures_evapor: summary?.with_measures?.evapor ?? 0,
		measures_delta: summary?.with_measures?.delta ?? 0,
		runoff_reduction_percent:
			typeof runoffReduction === "number" ? runoffReduction * 100 : 0,
	};
}

function buildRenderData(body: ReportBody) {
	return {
		...buildProjectFields(body),
		...buildAreaFields(body.accumulatedStats),
		...buildScenarioFields(body.activeScenario),
		...buildResultFields(body.result),
	};
}

async function convertWithGotenberg(docxBuffer: Buffer): Promise<ArrayBuffer> {
	const formData = new FormData();
	const docxBlob = new Blob([new Uint8Array(docxBuffer)], {
		type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	});
	formData.append("files", docxBlob, "report-blueprint.docx");

	const res = await fetch(
		`${process.env.GOTENBERG_URL}/forms/libreoffice/convert`,
		{
			method: "POST",
			body: formData,
			headers: {
				Authorization: `Basic ${btoa(process.env.GOTENBERG_USERNAME + ":" + process.env.GOTENBERG_PASSWORD)}`,
			},
		},
	);

	if (!res.ok) throw new Error("Gotenberg Konvertierung fehlgeschlagen");
	return res.arrayBuffer();
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as ReportBody;

		const templatePath = path.join(
			process.cwd(),
			"src",
			"templates",
			"report-blueprint.docx",
		);
		if (!fs.existsSync(templatePath)) {
			throw new Error(
				"report-blueprint.docx nicht im templates Ordner gefunden!",
			);
		}

		const content = fs.readFileSync(templatePath, "binary");
		const zip = new PizZip(content);
		const doc = new Docxtemplater(zip, {
			paragraphLoop: true,
			linebreaks: true,
		});

		doc.render(buildRenderData(body));
		const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });

		const pdfBuffer = await convertWithGotenberg(docxBuffer);

		return new Response(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="Bericht_${body.project?.name ?? "Report"}.pdf"`,
			},
		});
	} catch (error) {
		console.error("REPORT_ERROR:", error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
