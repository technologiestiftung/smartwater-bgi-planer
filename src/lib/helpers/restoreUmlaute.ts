function restoreUmlaute(input: string): string {
	return input
		.replace(/Ae/g, "Ä")
		.replace(/Oe/g, "Ö")
		.replace(/Ue/g, "Ü")
		.replace(/ae/g, "ä")
		.replace(/oe/g, "ö")
		.replace(/ue/g, "ü")
		.replace(/ss/g, "ß");
}

export default restoreUmlaute;
