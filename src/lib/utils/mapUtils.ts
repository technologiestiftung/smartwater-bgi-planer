export function getEpsgFromCrs(crs: string) {
	// Handle different CRS notation formats for EPSG codes
	const epsgMatch =
		crs.match(/EPSG[:/](\d+)/i) ||
		crs.match(/def\/crs\/EPSG\/\d+\/(\d+)/i) ||
		crs.match(/urn:ogc:def:crs:EPSG::(\d+)/i);
	return epsgMatch ? `EPSG:${epsgMatch[1]}` : crs;
}
