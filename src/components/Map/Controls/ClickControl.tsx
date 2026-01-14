"use client";

import FeatureModal from "@/components/FeatureDisplayControl/FeatureModal";
import { fetchFeatureInfo } from "@/lib/helpers/wmsFeatureInfo";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import Overlay, { Options } from "ol/Overlay.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";

// --- Typen & Konstanten ---
interface ClickControlProps {
	layerIds: string[];
	vectorLayerIds: string[];
	wmsLayerIds: string[];
	currentConfig?: any;
	overlayOptions?: Options;
	renderContent: (
		feature: any,
		layerId: string,
		onClose: () => void,
	) => React.ReactNode;
	minZoomForClick?: number;
}

type Selection = {
	feature: any;
	layerId: string;
	coordinate: [number, number];
	displayMode: "overlay" | "modal";
};

type OverlayPositioning =
	| "bottom-left"
	| "bottom-right"
	| "top-left"
	| "top-right";

const POSITION_OFFSETS: Record<OverlayPositioning, [number, number]> = {
	"top-left": [5, 15],
	"top-right": [-5, 15],
	"bottom-left": [15, -5],
	"bottom-right": [-15, -5],
};

const ClickControl: FC<ClickControlProps> = ({
	vectorLayerIds,
	wmsLayerIds,
	currentConfig,
	overlayOptions,
	renderContent,
	minZoomForClick = 4,
}) => {
	const map = useMapStore((state) => state.map);
	const { isDrawing, isBlockAreaSelecting, isDrawingNote } = useUiStore();

	// Zustand für das aktuell ausgewählte Element
	const [selection, setSelection] = useState<Selection | null>(null);
	const [cardPosition, setCardPosition] =
		useState<OverlayPositioning>("bottom-left");
	const [isLoading, setIsLoading] = useState(false);

	const overlayRef = useRef<HTMLDivElement>(null);
	const overlayInstanceRef = useRef<Overlay | null>(null);
	const overlaySizeRef = useRef({ width: 0, height: 0 });

	// --- Hilfsfunktionen ---

	const handleClose = useCallback(() => {
		setSelection(null);
	}, []);

	const calculatePositioning = useCallback(
		(pixel: [number, number]): OverlayPositioning => {
			if (!map) return "top-left";
			const mapSize = map.getSize();
			if (!mapSize) return "top-left";

			const { width, height } = overlaySizeRef.current;
			const [pX, pY] = pixel;
			const [mW, mH] = mapSize;
			const buffer = 15;

			const vertical = pY + height + buffer > mH ? "bottom" : "top";
			const horizontal = pX + width + buffer > mW ? "right" : "left";
			return `${vertical}-${horizontal}` as OverlayPositioning;
		},
		[map],
	);

	/**
	 * SUCHE 1: Vektor Features (Notizen & Zeichnungen)
	 * Diese Suche ist instantan, da die Daten lokal im Browser liegen.
	 */
	const findVectorFeature = useCallback(
		(pixel: [number, number]) => {
			if (!map) return null;

			return map.forEachFeatureAtPixel(
				pixel,
				(feature, layer) => {
					const id = layer?.get("id");
					if (!id) return;

					// Priorität 1: Notizen (Immer Vorrang)
					if (id === "module1_notes") {
						const clusteredFeatures = feature.get("features");
						if (clusteredFeatures && clusteredFeatures.length > 1) return; // Keine Cluster-Klicks
						return { feature, layerId: id };
					}

					// Priorität 2: Gezeichnete Objekte
					if (vectorLayerIds.includes(id)) {
						return { feature, layerId: id };
					}
				},
				{
					hitTolerance: 4, // Macht das Treffen von Punkten/Linien einfacher
				},
			);
		},
		[map, vectorLayerIds],
	);

	/**
	 * SUCHE 2: WMS Features (Server-Abfrage)
	 * Parallelisierte Abfrage aller query-fähigen Layer.
	 */
	const findWmsFeature = useCallback(
		async (coordinate: [number, number]) => {
			if (!map || wmsLayerIds.length === 0) return null;

			const activeWmsLayers = map
				.getAllLayers()
				.filter((l) => l.getVisible() && wmsLayerIds.includes(l.get("id")))
				.reverse(); // Oberste Layer zuerst

			// Alle Requests gleichzeitig starten
			const fetchPromises = activeWmsLayers.map(async (layer) => {
				const layerId = layer.get("id");
				try {
					const result = await fetchFeatureInfo({ coordinate, layerId, map });
					if (result?.attributes && Object.keys(result.attributes).length > 0) {
						return { feature: result.attributes, layerId };
					}
				} catch (e) {
					console.error(e);
					return null;
				}
				return null;
			});

			const results = await Promise.all(fetchPromises);
			return results.find((res) => res !== null) || null;
		},
		[map, wmsLayerIds],
	);

	// --- Effects ---

	// 1. Overlay Initialisierung
	useEffect(() => {
		if (!map || !overlayRef.current) return;

		const overlay = new Overlay({
			element: overlayRef.current,
			id: "ClickControl-overlay",
			stopEvent: true, // Verhindert Klicks durch das Tooltip auf die Karte
			...overlayOptions,
		});

		map.addOverlay(overlay);
		overlayInstanceRef.current = overlay;

		return () => {
			map.removeOverlay(overlay);
		};
	}, [map, overlayOptions]);

	// 2. Click Handler Logik
	useEffect(() => {
		if (!map) return;

		const handleClick = async (evt: any) => {
			// Blockieren wenn im Zeichen-Modus
			if (isDrawing || isBlockAreaSelecting || isDrawingNote) return;

			// Zoom-Check
			if ((map.getView().getZoom() ?? 0) < minZoomForClick) return;

			// A. Zuerst Vektor-Features suchen (Schnell/Lokal)
			const vectorMatch = findVectorFeature(evt.pixel);

			if (vectorMatch) {
				setCardPosition(calculatePositioning(evt.pixel));
				setSelection({
					...vectorMatch,
					coordinate: evt.coordinate,
					displayMode: "overlay",
				});
				return; // Suche beenden, Vektor hat Priorität
			}

			// B. Wenn kein Vektor, dann WMS suchen (Langsam/Server)
			if (wmsLayerIds.length > 0) {
				setIsLoading(true);
				document.body.style.cursor = "wait";

				try {
					const wmsMatch = await findWmsFeature(evt.coordinate);
					if (wmsMatch) {
						// Prüfen ob Modal oder Tooltip laut Config
						const isModal =
							currentConfig?.featureDisplay === "modal" &&
							currentConfig?.canQueryFeatures?.includes(wmsMatch.layerId);

						setCardPosition(calculatePositioning(evt.pixel));
						setSelection({
							...wmsMatch,
							coordinate: evt.coordinate,
							displayMode: isModal ? "modal" : "overlay",
						});
					} else {
						setSelection(null);
					}
				} finally {
					setIsLoading(false);
					document.body.style.cursor = "auto";
				}
			} else {
				setSelection(null);
			}
		};

		map.on("click", handleClick);
		return () => {
			map.un("click", handleClick);
			document.body.style.cursor = "auto";
		};
	}, [
		map,
		isDrawing,
		isBlockAreaSelecting,
		isDrawingNote,
		minZoomForClick,
		findVectorFeature,
		findWmsFeature,
		calculatePositioning,
		currentConfig,
		wmsLayerIds,
	]);

	// 3. Overlay Positionierung synchronisieren
	useEffect(() => {
		const overlay = overlayInstanceRef.current;
		if (!overlay) return;

		if (selection?.displayMode === "overlay" && selection.coordinate) {
			overlay.setPositioning(cardPosition);
			overlay.setOffset(POSITION_OFFSETS[cardPosition]);
			overlay.setPosition(selection.coordinate);
		} else {
			overlay.setPosition(undefined);
		}
	}, [selection, cardPosition]);

	// 4. Resize Observer für korrekte Positionsberechnung
	useEffect(() => {
		if (!overlayRef.current) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				overlaySizeRef.current = {
					width: entry.contentRect.width,
					height: entry.contentRect.height,
				};
			}
		});
		observer.observe(overlayRef.current);
		return () => observer.disconnect();
	}, []);

	return (
		<>
			{/* Overlay für Tooltips / Notizen / Menüs */}
			<div
				ref={overlayRef}
				className="ClickControl-root"
				style={{
					pointerEvents: selection?.displayMode === "overlay" ? "auto" : "none",
				}}
			>
				{selection?.displayMode === "overlay" &&
					renderContent(selection.feature, selection.layerId, handleClose)}
			</div>

			{/* Modal-Anzeige (außerhalb des OL-Overlays) */}
			{selection?.displayMode === "modal" && (
				<FeatureModal
					attributes={
						selection.feature?.getProperties
							? selection.feature.getProperties()
							: selection.feature
					}
					layerId={selection.layerId}
					coordinate={selection.coordinate}
					onClose={handleClose}
				/>
			)}

			{/* Optional: Globaler Loader-Indikator (CSS-Klasse hinzufügen falls gewünscht) */}
			{isLoading && (
				<div className="pointer-events-none fixed right-4 bottom-4 animate-pulse rounded bg-white/80 p-2 text-xs shadow-sm">
					Lade Feature-Info...
				</div>
			)}
		</>
	);
};

export default ClickControl;
