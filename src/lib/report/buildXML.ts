// lib/report/buildHazardBullet.ts

const VALID_COLORS = [
	"red",
	"yellow",
	"green",
	"cyan",
	"magenta",
	"blue",
	"darkBlue",
	"darkRed",
] as const;
type HighlightColor = (typeof VALID_COLORS)[number];

function escapeXml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

export function buildXMLTitle(
	title: string,
	color?: HighlightColor,
	notes?: string,
	fontSize: number = 10,
): string {
	if (color && !VALID_COLORS.includes(color)) {
		throw new Error(
			`Invalid highlight color "${color}". Must be one of: ${VALID_COLORS.join(", ")}`,
		);
	}

	const sizeVal = fontSize * 2;

	const highlightTag = color ? `<w:highlight w:val="${color}"/>` : "";
	const rPr = `<w:rPr>${highlightTag}<w:sz w:val="${sizeVal}"/><w:szCs w:val="${sizeVal}"/></w:rPr>`;

	const titleParagraph = `<w:p><w:r>${rPr}<w:t>${escapeXml(title)}</w:t></w:r></w:p>`;

	const notesParagraph = notes
		? `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr></w:pPr><w:r><w:rPr><w:sz w:val="${sizeVal}"/><w:szCs w:val="${sizeVal}"/></w:rPr><w:t xml:space="preserve">Notiz: ${escapeXml(notes)}</w:t></w:r></w:p>`
		: "";

	return (titleParagraph + notesParagraph).replace(/>\s+</g, "><").trim();
}

export function buildBulletXml(
	color: HighlightColor,
	hazard: string,
	notes?: string,
	fontSize: number = 10,
): string {
	if (!VALID_COLORS.includes(color)) {
		throw new Error(
			`Invalid highlight color "${color}". Must be one of: ${VALID_COLORS.join(", ")}`,
		);
	}

	const sizeVal = fontSize * 2;

	const hazardParagraph = `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="ListParagraph"/>
        <w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:highlight w:val="${color}"/>
          <w:sz w:val="${sizeVal}"/>
          <w:szCs w:val="${sizeVal}"/>
        </w:rPr>
        <w:t>${escapeXml(hazard)}</w:t>
      </w:r>
    </w:p>
  `;

	const notesParagraph = notes
		? `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="ListParagraph"/>
        <w:numPr><w:ilvl w:val="1"/><w:numId w:val="${2}"/></w:numPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="${sizeVal}"/>
          <w:szCs w:val="${sizeVal}"/>
        </w:rPr>
        <w:t xml:space="preserve">Notiz: ${escapeXml(notes)}</w:t>
      </w:r>
    </w:p>
  `
		: "";

	return (hazardParagraph + notesParagraph).replace(/>\s+</g, "><").trim();
}
