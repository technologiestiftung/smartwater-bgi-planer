// lib/convertToPdf.ts
import libre from "libreoffice-convert";

export async function convertToPdf(docxBuffer: Buffer): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		libre.convert(docxBuffer, ".pdf", undefined, (err, result) => {
			if (err) reject(err);
			else resolve(result);
		});
	});
}
