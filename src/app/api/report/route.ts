import Docxtemplater from "docxtemplater";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";
import PizZip from "pizzip";

// ---------- body types ----------
interface ReportBody {
	project: {
		id: string;
		name: string;
		description: string;
		useCase: string;
		createdAt: number;
		updatedAt: number;
	} | null;
	activeScenario: {
		id: string;
		name: string;
		measures: Array<{
			id: string;
			name: string;
			area: number;
			connectedArea: number;
			code: string | null;
			configId: string;
		}>;
		connectedAreas: Array<{ id: string; area: number }>;
	} | null;
	datum: string;
	measures: {
		[key: string]: boolean | null;
	};
	notes: string[];
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

function buildScenarioFields(scenario: ReportBody["activeScenario"]) {
	const allMeasures: Array<{ name: string; configId?: string }> = [
		{ name: "green_roof_ext" },
		{ name: "green_roof_int" },
		{ name: "3G5" },
		{ name: "permeable_paving" },
		{ name: "unpaving", configId: "3E2" },
		{ name: "unpaving", configId: "3B1" },
		{ name: "to_swale" },
		{ name: "to_surf_infil" },
		{ name: "to_swale_trench" },
		{ name: "3V4" },
		{ name: "to_trench" },
		{ name: "3S1" },
		{ name: "to_cistern" },
		{ name: "3S4" },
		{ name: "3S5" },
	];
	const measures = scenario?.measures ?? [];
	if (!measures.length) {
		return [];
	}
	const setMeasures: Record<string, string> = {};
	allMeasures.forEach((measure) => {
		const findMeasure = measures.find(
			(findSingleMeasure) => findSingleMeasure.name === measure.name,
		);
		if (!findMeasure) {
			setMeasures[`p_${measure.name}`] = "0";
			setMeasures[`ca_${measure.name}`] = "-";
		} else {
			setMeasures[
				`p_${findMeasure.name}${measure.configId ? `_${measure.configId}` : ""}`
			] = findMeasure.area ? findMeasure.area.toString() : "0";
			setMeasures[
				`ca_${findMeasure.name}${measure.configId ? `_${measure.configId}` : ""}`
			] = findMeasure.connectedArea
				? findMeasure.connectedArea.toString()
				: "-";
		}
	});
	// Baumstandort
	const numberOfTrees = measures.filter(
		(m) => m.name.startsWith("trees") && m.configId === "3B2",
	).length;
	setMeasures["t_n"] = numberOfTrees.toString();
	// Optimierter Baumstandort
	const numberOfOptimizedTrees = measures.filter(
		(m) => m.name.startsWith("trees") && m.configId === "3V5",
	).length;
	setMeasures["t_o"] = numberOfOptimizedTrees.toString();
	setMeasures["ca_t_o"] =
		measures
			.find((m) => m.name.startsWith("trees") && m.configId === "3V5")
			?.connectedArea.toString() ?? "-";
	return setMeasures;
}

// eslint-disable-next-line complexity
function buildMeasureFields(measures: ReportBody["measures"]) {
	function translateMeasureAnswer(answer: boolean | null): string {
		if (answer === true) return "Relevant";
		if (answer === false) return "Nicht Relevant";
		return "Nicht Beantwortet";
	}
	return Object.fromEntries(
		Object.entries(measures).map(([id, answer]) => [
			id,
			translateMeasureAnswer(answer),
		]),
	);
}

// eslint-disable-next-line complexity
function buildPlanningNotes(notes: ReportBody["notes"]) {
	if (notes.length === 0) {
		return { notes: ["Keine Anmerkungen vorhanden."] };
	}
	return { notes };
}

function buildRenderData(body: ReportBody) {
	return {
		...buildProjectFields(body),
		...buildScenarioFields(body.activeScenario),
		...buildMeasureFields(body.measures),
		...buildPlanningNotes(body.notes),
	};
}

async function convertWithGotenberg(docxBuffer: Buffer): Promise<ArrayBuffer> {
	const formData = new FormData();
	const docxBlob = new Blob([new Uint8Array(docxBuffer)], {
		type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	});
	formData.append("files", docxBlob, "report.docx");

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
			"report.docx",
		);
		if (!fs.existsSync(templatePath)) {
			throw new Error("report.docx nicht im templates Ordner gefunden!");
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
