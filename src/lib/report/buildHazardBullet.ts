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

// numId values must match your actual numbering.xml definitions —
// see note below on how to find the right ones.
const HAZARD_BULLET_NUM_ID = 2; // bullet-style list, level 0
const NOTES_BULLET_NUM_ID = 2; // same list, nested one level in

function escapeXml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

export function buildHazardTitle(color: HighlightColor, title: string): string {
	if (!VALID_COLORS.includes(color)) {
		throw new Error(
			`Invalid highlight color "${color}". Must be one of: ${VALID_COLORS.join(", ")}`,
		);
	}
	return `<w:p><w:r><w:rPr><w:highlight w:val="${color}"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>`;
}

export function buildHazardBulletXml(
	color: HighlightColor,
	hazard: string,
	notes?: string,
): string {
	if (!VALID_COLORS.includes(color)) {
		throw new Error(
			`Invalid highlight color "${color}". Must be one of: ${VALID_COLORS.join(", ")}`,
		);
	}

	const hazardParagraph = `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="ListParagraph"/>
        <w:numPr><w:ilvl w:val="0"/><w:numId w:val="${HAZARD_BULLET_NUM_ID}"/></w:numPr>
      </w:pPr>
      <w:r>
        <w:rPr><w:highlight w:val="${color}"/></w:rPr>
        <w:t>${escapeXml(hazard)}</w:t>
      </w:r>
    </w:p>
  `;

	const notesParagraph = notes
		? `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="ListParagraph"/>
        <w:numPr><w:ilvl w:val="1"/><w:numId w:val="${NOTES_BULLET_NUM_ID}"/></w:numPr>
      </w:pPr>
      <w:r>
        <w:t xml:space="preserve">Notiz: ${escapeXml(notes)}</w:t>
      </w:r>
    </w:p>
  `
		: "";

	return hazardParagraph + notesParagraph;
}
