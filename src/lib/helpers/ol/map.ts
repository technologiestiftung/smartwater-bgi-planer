import Config from "@/config/config";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import { register } from "ol/proj/proj4";
import VectorSource from "ol/source/Vector";
import proj4 from "proj4";

/**
 * Fits the map to the extent of a vector layer.
 * @param map The map to fit.
 * @param vectorLayer The vector layer to fit.
 */
export const fitMapToExtent = (
	map: Map,
	vectorLayer: VectorLayer<VectorSource>,
) => {
	const extent = vectorLayer.getSource()?.getExtent();
	if (extent?.every((val) => isFinite(val))) {
		map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 500 });
	}
};

/**
 * Registers named projections in proj4.
 * If proj4.defs("EPSG:25833") is true, or if Config.namedProjections is an array,
 * iterates over it and defines each named projection in proj4.
 * Registers proj4.
 * @return {void}
 */
export function initializeProjections() {
	if (proj4.defs("EPSG:25833")) return;

	if (Config?.namedProjections?.length) {
		Config.namedProjections.forEach(([name, def]) => {
			proj4.defs(name, def);
		});
	}
	register(proj4);
}

/**
 * Handles different CRS notation formats for EPSG codes
 * @param {string} crs - The CRS string to parse
 * @returns {string} - The EPSG code extracted from the CRS string
 */
export function getEpsgFromCrs(crs: string) {
	// Handle different CRS notation formats for EPSG codes
	const epsgMatch =
		crs.match(/EPSG[:/](\d+)/i) ||
		crs.match(/def\/crs\/EPSG\/\d+\/(\d+)/i) ||
		crs.match(/urn:ogc:def:crs:EPSG::(\d+)/i);
	return epsgMatch ? `EPSG:${epsgMatch[1]}` : crs;
}
