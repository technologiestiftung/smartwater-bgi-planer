"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useLayersStore } from "@/store/layers";
import { ManagedLayer } from "@/store/layers/types";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import { LinkIcon } from "@phosphor-icons/react";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import { FC, useCallback, useEffect, useState } from "react";

interface WMSLayer {
	name: string;
	title: string;
	abstract?: string;
}

const WMS_VERSION = "1.3.0";
const FETCH_DEBOUNCE_MS = 500;
const MIN_URL_LENGTH = 10;

const generateLayerId = () =>
	`uploaded_wms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const parseCapabilities = (xmlText: string): WMSLayer[] => {
	try {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlText, "text/xml");

		if (xmlDoc.querySelector("parsererror")) {
			throw new Error("Invalid XML response");
		}

		const layers: WMSLayer[] = [];
		const layerElements = xmlDoc.querySelectorAll(
			"Layer[queryable='1'], Layer:not([queryable])",
		);

		layerElements.forEach((layerEl) => {
			const nameEl = layerEl.querySelector("Name");
			const titleEl = layerEl.querySelector("Title");
			const abstractEl = layerEl.querySelector("Abstract");

			if (nameEl?.textContent && titleEl?.textContent) {
				layers.push({
					name: nameEl.textContent,
					title: titleEl.textContent,
					abstract: abstractEl?.textContent,
				});
			}
		});

		return layers;
	} catch (error) {
		console.error("Error parsing WMS capabilities:", error);
		return [];
	}
};

const buildCapabilitiesUrl = (baseUrl: string): URL => {
	const url = new URL(baseUrl);
	url.searchParams.set("service", "WMS");
	url.searchParams.set("request", "GetCapabilities");
	url.searchParams.set("version", WMS_VERSION);
	return url;
};

const createWMSLayer = (
	url: string,
	layerName: string,
	layerTitle: string,
	layerId: string,
) => {
	const wmsSource = new TileWMS({
		url,
		params: {
			LAYERS: layerName,
			TILED: true,
		},
		serverType: "geoserver",
		crossOrigin: "anonymous",
	});

	const wmsLayer = new TileLayer({ source: wmsSource });
	wmsLayer.set("name", layerTitle);
	wmsLayer.set("id", layerId);

	return wmsLayer;
};

const createManagedLayer = (
	layerId: string,
	layerTitle: string,
	olLayer: TileLayer<TileWMS>,
): ManagedLayer => ({
	id: layerId,
	config: {
		id: layerId,
		name: layerTitle,
		visibility: true,
		status: "loaded",
		elements: [],
	},
	olLayer,
	status: "loaded",
	visibility: true,
	opacity: 1,
	zIndex: 998,
	layerType: "subject",
});

const AddWMSButton: FC = () => {
	const map = useMapStore((state) => state.map);
	const { addLayer } = useLayersStore();
	const { setUploadError, setUploadSuccess, clearUploadStatus } = useUiStore();

	const [isOpen, setIsOpen] = useState(false);
	const [wmsUrl, setWmsUrl] = useState("");
	const [availableLayers, setAvailableLayers] = useState<WMSLayer[]>([]);
	const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = useState(false);
	const [isFetchingLayers, setIsFetchingLayers] = useState(false);

	const fetchWMSLayers = useCallback(async () => {
		if (!wmsUrl) return;

		setIsFetchingLayers(true);
		setAvailableLayers([]);
		clearUploadStatus();

		try {
			const url = buildCapabilitiesUrl(wmsUrl);
			const response = await fetch(url.toString());

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const xmlText = await response.text();
			const layers = parseCapabilities(xmlText);

			if (layers.length === 0) {
				setUploadError(
					"Keine Layer im WMS Service gefunden oder Service nicht erreichbar.",
				);
				return;
			}

			setAvailableLayers(layers);
		} catch (error) {
			console.error("Error fetching WMS capabilities:", error);

			if (error instanceof TypeError && error.message.includes("URL")) {
				setUploadError(
					"Ungültige URL. Bitte geben Sie eine vollständige URL ein.",
				);
			} else {
				setUploadError(
					"WMS Service nicht erreichbar. Überprüfen Sie die URL und CORS-Einstellungen.",
				);
			}
		} finally {
			setIsFetchingLayers(false);
		}
	}, [wmsUrl, clearUploadStatus, setUploadError]);

	const addWMSLayerToMap = useCallback(
		(url: string, layerName: string, layerTitle: string) => {
			if (!map) return;

			const layerId = generateLayerId();
			const wmsLayer = createWMSLayer(url, layerName, layerTitle, layerId);

			map.addLayer(wmsLayer);
			addLayer(createManagedLayer(layerId, layerTitle, wmsLayer));
		},
		[map, addLayer],
	);

	const handleAddLayers = useCallback(async () => {
		if (selectedLayers.size === 0) {
			setUploadError("Bitte wählen Sie mindestens einen Layer aus.");
			return;
		}

		setIsLoading(true);
		clearUploadStatus();

		try {
			const layersToAdd = availableLayers.filter((layer) =>
				selectedLayers.has(layer.name),
			);

			layersToAdd.forEach((layer) => {
				addWMSLayerToMap(wmsUrl, layer.name, layer.title);
			});

			setUploadSuccess(
				`${layersToAdd.length} WMS Layer erfolgreich hinzugefügt.`,
			);

			// Reset form
			setWmsUrl("");
			setAvailableLayers([]);
			setSelectedLayers(new Set());
			setIsOpen(false);
		} catch (error) {
			console.error("Error adding WMS layers:", error);
			setUploadError(
				"Fehler beim Hinzufügen der WMS Layer. Versuchen Sie es erneut.",
			);
		} finally {
			setIsLoading(false);
		}
	}, [
		selectedLayers,
		availableLayers,
		wmsUrl,
		addWMSLayerToMap,
		clearUploadStatus,
		setUploadSuccess,
		setUploadError,
	]);

	const handleLayerToggle = useCallback((layerName: string) => {
		setSelectedLayers((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(layerName)) {
				newSet.delete(layerName);
			} else {
				newSet.add(layerName);
			}
			return newSet;
		});
	}, []);

	const handleCancel = useCallback(() => {
		setWmsUrl("");
		setAvailableLayers([]);
		setSelectedLayers(new Set());
		setIsOpen(false);
		clearUploadStatus();
	}, [clearUploadStatus]);

	useEffect(() => {
		if (wmsUrl.length <= MIN_URL_LENGTH) return;

		try {
			new URL(wmsUrl);
			const timeoutId = setTimeout(fetchWMSLayers, FETCH_DEBOUNCE_MS);
			return () => clearTimeout(timeoutId);
		} catch {
			// Invalid URL, don't fetch
		}
	}, [wmsUrl, fetchWMSLayers]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<LinkIcon />
					WMS einbinden
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>WMS einbinden</DialogTitle>
					<DialogDescription>
						Geben Sie eine WMS URL ein um verfügbare Layer zu laden und
						auszuwählen.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div>
						<label htmlFor="wms-url" className="mb-2 block text-sm font-medium">
							WMS URL
						</label>
						<input
							id="wms-url"
							type="url"
							value={wmsUrl}
							onChange={(e) => setWmsUrl(e.target.value)}
							placeholder="https://gdi.berlin.de/services/wms/ua_wasserhaushalt_2022"
							className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>

					{isFetchingLayers && (
						<div className="py-4 text-center">
							<p className="text-sm text-gray-600">Lade verfügbare Layer...</p>
						</div>
					)}

					{availableLayers.length > 0 && (
						<div>
							<h4 className="mb-3 font-medium">Layerauswahl</h4>
							<div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-3">
								{availableLayers.map((layer, id) => (
									<label
										key={layer.name + id}
										className="flex cursor-pointer items-start gap-3 rounded p-2 hover:bg-gray-50"
									>
										<input
											type="checkbox"
											checked={selectedLayers.has(layer.name)}
											onChange={() => handleLayerToggle(layer.name)}
											className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<div className="min-w-0 flex-1">
											<div className="text-sm font-medium">{layer.title}</div>
											{layer.abstract && (
												<div className="mt-1 text-xs text-gray-500">
													{layer.abstract}
												</div>
											)}
										</div>
									</label>
								))}
							</div>
							{selectedLayers.size > 0 && (
								<p className="mt-2 text-sm text-gray-600">
									{selectedLayers.size} Layer ausgewählt
								</p>
							)}
						</div>
					)}
				</div>

				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={handleCancel} disabled={isLoading}>
						Abbrechen
					</Button>
					<Button
						variant="default"
						onClick={handleAddLayers}
						disabled={isLoading || selectedLayers.size === 0}
					>
						{isLoading ? "Hinzufügen..." : "Layers hinzufügen"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddWMSButton;
