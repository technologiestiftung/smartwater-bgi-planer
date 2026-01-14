"use client";

import FeatureModal from "@/components/FeatureDisplayControl/FeatureModal";
import { fetchFeatureInfo } from "@/lib/helpers/wmsFeatureInfo";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import Overlay, { Options } from "ol/Overlay.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";

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
	layerIds,
	vectorLayerIds,
	wmsLayerIds,
	currentConfig,
	overlayOptions,
	renderContent,
	minZoomForClick = 4,
}) => {
	const map = useMapStore((state) => state.map);
	const isDrawing = useUiStore((state) => state.isDrawing);
	const isBlockAreaSelecting = useUiStore(
		(state) => state.isBlockAreaSelecting,
	);
	const isDrawingNote = useUiStore((state) => state.isDrawingNote);

	const overlayRef = useRef<HTMLDivElement>(null);
	const overlayInstanceRef = useRef<Overlay | null>(null);
	const overlaySizeRef = useRef({ width: 0, height: 0 });

	const [features, setFeatures] = useState<any>();
	const [matchedLayerId, setMatchedLayerId] = useState<string | null>(null);
	const [modalData, setModalData] = useState<{
		attributes: Record<string, any>;
		layerId: string;
		coordinate?: [number, number];
	} | null>(null);

	const [cardPosition, setCardPosition] =
		useState<OverlayPositioning>("bottom-left");

	const calculatePositioning = useCallback(
		(pixel: [number, number]): OverlayPositioning => {
			if (!map) return "top-left";

			const mapSize = map.getSize();
			if (!mapSize) return "top-left";

			const { width: overlayWidth, height: overlayHeight } =
				overlaySizeRef.current;
			if (overlayWidth === 0 || overlayHeight === 0) return cardPosition;

			const [mapWidth, mapHeight] = mapSize;
			const [pixelX, pixelY] = pixel;
			const buffer = 10;

			const vertical: "top" | "bottom" =
				pixelY + overlayHeight + buffer > mapHeight ? "bottom" : "top";
			const horizontal: "left" | "right" =
				pixelX + overlayWidth + buffer > mapWidth ? "right" : "left";

			return `${vertical}-${horizontal}` as OverlayPositioning;
		},
		[map, cardPosition],
	);

	useEffect(() => {
		if (overlayInstanceRef.current) {
			overlayInstanceRef.current.setPositioning(cardPosition);
			overlayInstanceRef.current.setOffset(POSITION_OFFSETS[cardPosition]);
		}
	}, [cardPosition]);

	useEffect(() => {
		if (!features && !modalData && overlayInstanceRef.current) {
			overlayInstanceRef.current.setPosition(undefined);
		}
	}, [features, modalData]);

	const handleCloseOverlay = useCallback(() => {
		setFeatures(undefined);
		setMatchedLayerId(null);
		setModalData(null);
	}, []);

	useEffect(() => {
		if (!overlayRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				overlaySizeRef.current = { width, height };
			}
		});

		observer.observe(overlayRef.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!map || !overlayRef.current) return;

		const overlay = new Overlay({
			element: overlayRef.current,
			id: "ClickControl-root",
			positioning: cardPosition,
			offset: POSITION_OFFSETS[cardPosition],
			...overlayOptions,
		});

		overlayInstanceRef.current = overlay;
		map.addOverlay(overlay);

		const handleClick = async (evt: any) => {
			// 1. check ob wir uns im drawing mode befinden. falls ja, soll returned werden und die DrawButtons handeln die klicks
			if (isDrawing || isBlockAreaSelecting || isDrawingNote) {
				return;
			}

			// 2. wenn wir uns nicht im drawing mode befinden, muss ich checken was geklickt wurde.
			// hier gibt es priorisierungen
			// wurde eine notiz geklickt, soll sich die notiz karte öffnen (alles was darunter liegt, soll ignoriert werden)
			// wurde auf ein Feature von der drawLayerId geklickt soll sich das feature menu öffnen (alles darunter, soll ignoriert werden)
			// und als letzte priorität gibt es die canQueryFeatures mit einem array aus layern. diese sollen klickbar sein und dann entsprechend der featureDisplay als tooltip oder modal geöffnet werden

			const zoom = map.getView().getZoom() ?? 0;
			if (zoom < minZoomForClick) return;

			const pixel = evt.pixel;
			const coordinate = evt.coordinate;
			let matchedFeature: any = null;
			let matchedLayer: string | null = null;

			const newPositioning = calculatePositioning(pixel);
			if (newPositioning !== cardPosition) {
				setCardPosition(newPositioning);
			}

			// Priorität 1: Vector Features (Notizen) - sowohl neue als auch bestehende
			if (vectorLayerIds.includes("module1_notes")) {
				map.forEachFeatureAtPixel(pixel, (feature, layer) => {
					const currentLayerId = layer?.get("id");
					if (currentLayerId === "module1_notes" && !matchedFeature) {
						const clusteredFeatures = feature.get("features");
						const isCluster = clusteredFeatures?.length > 1;
						if (!isCluster) {
							matchedFeature = feature;
							matchedLayer = currentLayerId;
							return false;
						}
					}
					return true;
				});
			}

			// Priorität 2: Draw Layer Features
			if (!matchedFeature && vectorLayerIds.length > 1) {
				map.forEachFeatureAtPixel(pixel, (feature, layer) => {
					const currentLayerId = layer?.get("id");
					if (
						vectorLayerIds.includes(currentLayerId) &&
						currentLayerId !== "module1_notes" &&
						!matchedFeature
					) {
						const clusteredFeatures = feature.get("features");
						const isCluster = clusteredFeatures?.length > 1;
						if (!isCluster) {
							matchedFeature = feature;
							matchedLayer = currentLayerId;
							return false;
						}
					}
					return true;
				});
			}

			// Priorität 3: WMS Features (canQueryFeatures) - nur wenn kein Vector Feature gefunden
			if (!matchedFeature && wmsLayerIds.length > 0) {
				const allQueryableLayers = map
					.getAllLayers()
					.filter((l) => {
						const id = l.get("id");
						return id && wmsLayerIds.includes(id) && l.getVisible();
					})
					.reverse();

				for (const layer of allQueryableLayers) {
					const layerId = layer.get("id");
					try {
						const result = await fetchFeatureInfo({
							coordinate,
							layerId,
							map,
						});

						if (
							result?.attributes &&
							Object.keys(result.attributes).length > 0
						) {
							matchedFeature = result.attributes;
							matchedLayer = layerId;
							break; // Stop after first WMS match
						}
					} catch (error) {
						console.debug(`WMS query failed for layer ${layerId}:`, error);
					}
				}
			}

			if (matchedFeature && matchedLayer) {
				// Prüfe ob es ein Modal oder Tooltip sein soll
				const shouldShowModal =
					currentConfig?.canQueryFeatures?.includes(matchedLayer) &&
					currentConfig?.featureDisplay === "modal";

				if (shouldShowModal) {
					// Modal: Schließe Overlay und öffne Modal
					overlay.setPosition(undefined);
					setFeatures(undefined);
					setMatchedLayerId(null);
					setModalData({
						attributes: matchedFeature,
						layerId: matchedLayer,
						coordinate,
					});
				} else {
					// Tooltip/andere: Zeige im Overlay
					setModalData(null);
					overlay.setPosition(coordinate);
					setFeatures(matchedFeature);
					setMatchedLayerId(matchedLayer);
				}
			} else {
				// Nichts gefunden: Alles schließen
				overlay.setPosition(undefined);
				setFeatures(undefined);
				setMatchedLayerId(null);
				setModalData(null);
			}
		};

		map.on("click", handleClick);

		return () => {
			map.un("click", handleClick);
			map.removeOverlay(overlay);
			overlayInstanceRef.current = null;
		};
	}, [
		map,
		layerIds,
		vectorLayerIds,
		wmsLayerIds,
		currentConfig,
		overlayOptions,
		cardPosition,
		calculatePositioning,
		minZoomForClick,
		isDrawing,
		isBlockAreaSelecting,
		isDrawingNote,
	]);

	return (
		<>
			{/* Overlay für Tooltips/andere */}
			<div className="ClickControl-root" ref={overlayRef}>
				{features && matchedLayerId
					? renderContent(features, matchedLayerId, handleCloseOverlay)
					: null}
			</div>

			{/* Modal außerhalb des Overlays */}
			{modalData && (
				<FeatureModal
					attributes={modalData.attributes}
					layerId={modalData.layerId}
					coordinate={modalData.coordinate}
					onClose={handleCloseOverlay}
				/>
			)}
		</>
	);
};

export default ClickControl;
