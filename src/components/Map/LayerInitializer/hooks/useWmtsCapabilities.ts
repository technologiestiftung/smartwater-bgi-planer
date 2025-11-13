import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { useEffect, useState } from "react";

interface WMTSCapabilitiesMap {
	[url: string]: object;
}

export const useWmtsCapabilities = (
	config: any,
	flattenedLayerElements: any[],
) => {
	const [wmtsCapabilities, setWmtsCapabilities] = useState<WMTSCapabilitiesMap>(
		{},
	);
	const [capabilitiesLoaded, setCapabilitiesLoaded] = useState(false);

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
				setCapabilitiesLoaded(true);
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

				setWmtsCapabilities(capabilitiesMap);
			} catch (error) {
				console.error(
					"[LayerInitializer] Error loading WMTS capabilities:",
					error,
				);
			} finally {
				setCapabilitiesLoaded(true);
			}
		};

		loadAllWmtsCapabilities();
	}, [config, flattenedLayerElements]);

	return { wmtsCapabilities, capabilitiesLoaded };
};
