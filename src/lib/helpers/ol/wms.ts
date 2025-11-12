export interface WMSValidationResult {
	isValid: boolean;
	error?: string;
	hasLayers?: boolean;
}

export const validateWMSUrl = (url: string): WMSValidationResult => {
	try {
		const parsedUrl = new URL(url);
		const urlString = parsedUrl.toString().toLowerCase();
		const hasWmsIndicator =
			urlString.includes("wms") ||
			urlString.includes("service=wms") ||
			parsedUrl.searchParams.get("service")?.toLowerCase() === "wms";

		if (!hasWmsIndicator) {
			return { isValid: false, error: "URL scheint kein WMS Service zu sein" };
		}
		return { isValid: true };
	} catch {
		return { isValid: false, error: "Ungültige URL" };
	}
};

export const generatePreviewUrl = (
	baseUrl: string,
	layerName: string,
	wmsVersion: string,
): string => {
	const url = new URL(baseUrl);
	url.searchParams.set("SERVICE", "WMS");
	url.searchParams.set("VERSION", wmsVersion);
	url.searchParams.set("REQUEST", "GetMap");
	url.searchParams.set("LAYERS", layerName);
	url.searchParams.set("STYLES", "");
	url.searchParams.set("CRS", "EPSG:25833");
	url.searchParams.set("BBOX", "388000,5818000,392000,5821000");
	url.searchParams.set("WIDTH", "600");
	url.searchParams.set("HEIGHT", "600");
	url.searchParams.set("FORMAT", "image/png");
	return url.toString();
};

export const buildCapabilitiesUrl = (
	baseUrl: string,
	wmsVersion: string,
): URL => {
	const url = new URL(baseUrl.trim());
	url.searchParams.delete("service");
	url.searchParams.delete("SERVICE");
	url.searchParams.delete("request");
	url.searchParams.delete("REQUEST");
	url.searchParams.delete("version");
	url.searchParams.delete("VERSION");

	url.searchParams.set("service", "WMS");
	url.searchParams.set("request", "GetCapabilities");
	url.searchParams.set("version", wmsVersion);
	return url;
};

export const getBaseUrl = (urlString: string): string => {
	const url = new URL(urlString.trim());
	url.search = "";
	return url.toString();
};
