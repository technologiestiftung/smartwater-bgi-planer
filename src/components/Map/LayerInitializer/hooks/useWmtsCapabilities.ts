import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { useEffect, useState } from "react";

interface WMTSCapabilitiesMap {
	[url: string]: object;
}

export const useWmtsCapabilities = (
	flattenedLayerElements: any[],
	config: any,
) => {
	const [capabilities, setCapabilities] = useState<WMTSCapabilitiesMap>({});
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (!config || flattenedLayerElements.length === 0) return;

		const loadAllWmtsCapabilities = async () => {
			const wmtsServices = flattenedLayerElements.filter(
				(layer) =>
					layer.service?.typ === "WMTS" && layer.service?.capabilitiesUrl,
			);

			const uniqueCapabilitiesUrls = [
				...new Set(
					wmtsServices
						.map((layer) => layer.service?.capabilitiesUrl)
						.filter(Boolean),
				),
			] as string[];

			if (uniqueCapabilitiesUrls.length === 0) {
				setLoaded(true);
				return;
			}

			try {
				const capabilitiesPromises = uniqueCapabilitiesUrls.map(async (url) => {
					const response = await fetch(
						`/api/wmts-capabilities?url=${encodeURIComponent(url)}`,
					);
					if (!response.ok) {
						throw new Error(
							`Failed to fetch WMTS capabilities from ${url}: ${response.status}`,
						);
					}

					const { xml } = await response.json();
					const parser = new WMTSCapabilities();
					return { url, capabilities: parser.read(xml) };
				});

				const results = await Promise.all(capabilitiesPromises);
				const capabilitiesMap = results.reduce((acc, { url, capabilities }) => {
					acc[url] = capabilities;
					return acc;
				}, {} as WMTSCapabilitiesMap);

				setCapabilities(capabilitiesMap);
			} catch (error) {
				console.error(
					"[useWmtsCapabilities] Error loading WMTS capabilities:",
					error,
				);
			} finally {
				setLoaded(true);
			}
		};

		loadAllWmtsCapabilities();
	}, [config, flattenedLayerElements]);

	return { capabilities, loaded };
};
