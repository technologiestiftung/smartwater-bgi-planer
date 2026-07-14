// app/api/generate-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fillDocxTemplate } from "@/lib/report/fillTemplate";
import { convertToPdf } from "@/lib/report/covertToPDF";

export async function POST(req: NextRequest) {
	const data = await req.json();

	const filledDocx = fillDocxTemplate(data);
	const pdfBuffer = await convertToPdf(filledDocx);
	const pdfBytes = new Uint8Array(pdfBuffer);

	return new NextResponse(pdfBytes, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="report.pdf"`,
		},
	});
}
