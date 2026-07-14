// lib/fillTemplate.ts
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const TEMPLATE_PATH = path.join(
	process.cwd(),
	"public",
	"report",
	"report-blueprint.docx",
);

export function fillDocxTemplate(data: Record<string, any>): Buffer {
	const content = fs.readFileSync(TEMPLATE_PATH, "binary");
	const zip = new PizZip(content);
	const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

	doc.render(data);

	return doc.getZip().generate({ type: "nodebuffer" });
}
