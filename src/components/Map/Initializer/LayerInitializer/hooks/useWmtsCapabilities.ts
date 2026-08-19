"use client";

import { LayerElement } from "@/store/layers/types";
import { useMapStore } from "@/store/map"; // <-- import your store
import { MapConfig } from "@/store/map/types";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { useEffect, useState } from "react";

interface WMTSCapabilitiesMap {
	[url: string]: object;
}

export const useWmtsCapabilities = (
	config: MapConfig | null,
	flattenedLayerElements: LayerElement[],
) => {
	const [wmtsCapabilities, setWmtsCapabilities] = useState<WMTSCapabilitiesMap>(
		{},
	);
	const [capabilitiesLoaded, setCapabilitiesLoaded] = useState(false);
	const setMapError = useMapStore((state) => state.setMapError);

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

			const capabilitiesPromises = uniqueCapabilitiesUrls.map(async (url) => {
				const response = await fetch(
					`/api/wmts-capabilities?url=${encodeURIComponent(url)}`,
				);
				if (!response.ok) {
					throw new Error(
						`Failed to fetch WMTS capabilities from ${url}: ${response.status} ${response.statusText}`,
					);
				}

				const { xml } = await response.json();
				const parser = new WMTSCapabilities();
				return { url, capabilities: parser.read(xml) };
			});

			const results = await Promise.allSettled(capabilitiesPromises);
			const capabilitiesMap: WMTSCapabilitiesMap = {};
			let hasFailure = false;

			results.forEach((result) => {
				if (result.status === "fulfilled") {
					capabilitiesMap[result.value.url] = result.value.capabilities;
				} else {
					hasFailure = true;
					console.error(
						"[useWmtsCapabilities] Error loading WMTS capabilities",
						result.reason,
					);
				}
			});

			setWmtsCapabilities(capabilitiesMap);
			if (hasFailure && Object.keys(capabilitiesMap).length === 0) {
				setMapError(
					true,
					"Fehler beim Laden der Karten. Bitte versuchen Sie es später erneut.",
				);
			}
			setCapabilitiesLoaded(true);
		};

		loadAllWmtsCapabilities();
	}, [config, flattenedLayerElements, setMapError]);

	return { wmtsCapabilities, capabilitiesLoaded };
};
