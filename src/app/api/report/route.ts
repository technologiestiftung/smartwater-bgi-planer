import { ResultStatistics } from "@/types/result";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";
import PizZip from "pizzip";
import sizeOf from "image-size";
import ImageModule from "docxtemplater-image-module-free";

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
	stats: ResultStatistics | null;
	datum: string;
	measures: {
		[key: string]: boolean | null;
	};
	notes: {
		[key: string]: string[];
	};
	plot_critical_hours?: string;
	plot_critical_events?: string;
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
	const setMeasures: Record<string, string> = {};
	allMeasures.forEach((measure) => {
		const findMeasure = measures.find(
			(findSingleMeasure) => findSingleMeasure.name === measure.name,
		);
		const configId = measure.configId ? `_${measure.configId}` : "";
		if (!findMeasure) {
			setMeasures[`p_${measure.name}${configId}`] = "0";
			setMeasures[`ca_${measure.name}${configId}`] = "-";
		} else {
			setMeasures[`p_${findMeasure.name}${configId}`] = findMeasure.area
				? findMeasure.area.toString()
				: "0";
			setMeasures[`ca_${findMeasure.name}${configId}`] =
				findMeasure.connectedArea ? findMeasure.connectedArea.toString() : "-";
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

function buildPlanningNotes(notes: ReportBody["notes"]) {
	return { ...notes };
}

function buildStatsFields(stats: ReportBody["stats"]) {
	if (!stats) {
		return {
			delta_w_status_quo: "-",
			delta_w_with_measures: "-",
			runoff_status_quo: "-",
			runoff_with_measures: "-",
			infiltr_status_quo: "-",
			infiltr_with_measures: "-",
			evapor_status_quo: "-",
			evapor_with_measures: "-",
			runoffReduction: "-",
			overflow_volume_status_quo: "-",
			overflow_volume_simulation: "-",
			critical_hours_status_quo: "-",
			critical_hours_simulation: "-",
			critical_events_status_quo: "-",
			critical_events_simulation: "-",
		};
	}
	const original = stats.water_balance.status_quo[0]!;
	const with_measures = stats.water_balance.with_measures[0]!;
	const wqiOrig = stats.water_quality_indicators.status_quo;
	const wqiSim = stats.water_quality_indicators.with_measures;
	return {
		delta_w_status_quo: original.delta_w.toFixed(2),
		delta_w_with_measures: with_measures.delta_w.toFixed(2),
		runoff_status_quo: original.runoff.toFixed(2),
		runoff_with_measures: with_measures.runoff.toFixed(2),
		infiltr_status_quo: original.infiltr.toFixed(2),
		infiltr_with_measures: with_measures.infiltr.toFixed(2),
		evapor_status_quo: original.evapor.toFixed(2),
		evapor_with_measures: with_measures.evapor.toFixed(2),
		runoffReduction: stats.runoff_reduction_percent[0].toFixed(2),
		overflow_volume_status_quo: wqiOrig.overflow_volume[0].toFixed(2),
		overflow_volume_simulation: wqiSim.overflow_volume[0].toFixed(2),
		critical_hours_status_quo: wqiOrig.critical_hours[0].toFixed(2),
		critical_hours_simulation: wqiSim.critical_hours[0].toFixed(2),
		critical_events_status_quo: wqiOrig.critical_events[0].toFixed(2),
		critical_events_simulation: wqiSim.critical_events[0].toFixed(2),
	};
}

function buildRenderData(body: ReportBody) {
	return {
		...buildProjectFields(body),
		...buildScenarioFields(body.activeScenario),
		...buildMeasureFields(body.measures),
		...buildPlanningNotes(body.notes),
		...buildStatsFields(body.stats),
		plot_critical_hours: body.plot_critical_hours,
		plot_critical_events: body.plot_critical_events,
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

		const imageModule = new ImageModule({
			centered: false,
			getImage(tagValue: string) {
				if (tagValue.startsWith("data:")) {
					// full data URL — extract the part after the comma
					const base64Data = tagValue.split(",")[1];
					if (!base64Data) {
						throw new Error("Ungültige Data URL für Bild");
					}
					return Buffer.from(base64Data, "base64");
				}

				if (/^[A-Za-z0-9+/=]+$/.test(tagValue)) {
					// raw base64 string, no prefix
					return Buffer.from(tagValue, "base64");
				}

				// fallback: treat as a file path under public/
				const imagePath = path.join(process.cwd(), "public", tagValue);
				if (!fs.existsSync(imagePath)) {
					throw new Error(`Bild nicht gefunden: ${imagePath}`);
				}
				return fs.readFileSync(imagePath);
			},
			getSize(img: Buffer) {
				const dimensions = sizeOf(img);
				// scale down if needed, e.g. max width 500px
				const maxWidth = 500;
				const ratio =
					dimensions.width && dimensions.width > maxWidth
						? maxWidth / dimensions.width
						: 1;
				return [
					Math.round((dimensions.width ?? maxWidth) * ratio),
					Math.round((dimensions.height ?? maxWidth) * ratio),
				];
			},
		});

		const doc = new Docxtemplater(zip, {
			modules: [imageModule],
			paragraphLoop: true,
			linebreaks: true,
		});

		console.log("buildRenderData(body) :>> ", buildRenderData(body));

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
