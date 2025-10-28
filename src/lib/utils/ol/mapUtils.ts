import Config from "@/config/config";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";

export function initializeProjections() {
	if (proj4.defs("EPSG:25833")) return;

	if (Config?.namedProjections?.length) {
		Config.namedProjections.forEach(([name, def]) => {
			proj4.defs(name, def);
		});
	}
	register(proj4);
}

export function getEpsgFromCrs(crs: string) {
	// Handle different CRS notation formats for EPSG codes
	const epsgMatch =
		crs.match(/EPSG[:/](\d+)/i) ||
		crs.match(/def\/crs\/EPSG\/\d+\/(\d+)/i) ||
		crs.match(/urn:ogc:def:crs:EPSG::(\d+)/i);
	return epsgMatch ? `EPSG:${epsgMatch[1]}` : crs;
}
