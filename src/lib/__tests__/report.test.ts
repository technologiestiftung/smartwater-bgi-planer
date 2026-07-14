// lib/__tests__/report.test.ts
import { beforeAll, describe, expect, test } from "@jest/globals";
import fs from "fs";
import path from "path";
import { reportCases } from "./report.cases";
import { fillDocxTemplate } from "../report/fillTemplate";
import { convertToPdf } from "../report/covertToPDF";

const templatePath = path.join(
	process.cwd(),
	"public",
	"report",
	"report-blueprint.docx",
);
const outputDir = path.join(
	process.cwd(),
	"src",
	"lib",
	"__tests__",
	"test-output",
);

beforeAll(() => {
	if (!fs.existsSync(templatePath)) {
		throw new Error(
			`Template not found at ${templatePath}. Make sure report-blueprint.docx exists before running tests.`,
		);
	}
	fs.mkdirSync(outputDir, { recursive: true });
});

function slugify(name: string) {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

describe("convertToPdf", () => {
	test.each(reportCases)(
		"converts $name to a valid PDF buffer",
		async ({ name, data }) => {
			const docxBuffer = fillDocxTemplate(data);
			const pdfBuffer = await convertToPdf(docxBuffer);

			expect(pdfBuffer).toBeInstanceOf(Buffer);
			expect(pdfBuffer.subarray(0, 5).toString()).toBe("%PDF-");

			fs.writeFileSync(path.join(outputDir, `${slugify(name)}.pdf`), pdfBuffer);
		},
		15000,
	);
});
