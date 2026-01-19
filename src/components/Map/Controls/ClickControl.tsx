"use client";

import FeatureModal from "@/components/FeatureDisplay/FeatureModal";
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
	minZoomForClick = 0,
}) => {
	const map = useMapStore((state) => state.map);
	const { isDrawing, isBlockAreaSelecting, isDrawingNote } = useUiStore();

	const [selection, setSelection] = useState<Selection | null>(null);
	const [cardPosition, setCardPosition] =
		useState<OverlayPositioning>("bottom-left");
	const [isLoading, setIsLoading] = useState(false);

	const overlayRef = useRef<HTMLDivElement>(null);
	const overlayInstanceRef = useRef<Overlay | null>(null);
	const overlaySizeRef = useRef({ width: 0, height: 0 });

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

	const findVectorFeature = useCallback(
		(pixel: [number, number]) => {
			if (!map) return null;

			return map.forEachFeatureAtPixel(
				pixel,
				(feature, layer) => {
					const id = layer?.get("id");
					if (!id) return;

					if (id === "module1_notes") {
						const clusteredFeatures = feature.get("features");
						if (clusteredFeatures && clusteredFeatures.length > 1) return;
						return { feature, layerId: id };
					}

					if (vectorLayerIds.includes(id)) {
						return { feature, layerId: id };
					}
				},
				{
					hitTolerance: 4,
				},
			);
		},
		[map, vectorLayerIds],
	);

	const findWmsFeature = useCallback(
		async (coordinate: [number, number]) => {
			if (!map || wmsLayerIds.length === 0) return null;

			const activeWmsLayers = map
				.getAllLayers()
				.filter((l) => l.getVisible() && wmsLayerIds.includes(l.get("id")))
				.reverse();

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

	useEffect(() => {
		if (!map || !overlayRef.current) return;

		const overlay = new Overlay({
			element: overlayRef.current,
			id: "ClickControl-overlay",
			stopEvent: true,
			...overlayOptions,
		});

		map.addOverlay(overlay);
		overlayInstanceRef.current = overlay;

		return () => {
			map.removeOverlay(overlay);
		};
	}, [map, overlayOptions]);

	useEffect(() => {
		if (!map) return;

		const handleClick = async (evt: any) => {
			if (isDrawing || isBlockAreaSelecting || isDrawingNote) return;

			if ((map.getView().getZoom() ?? 0) < minZoomForClick) return;

			const vectorMatch = findVectorFeature(evt.pixel);

			if (vectorMatch) {
				setCardPosition(calculatePositioning(evt.pixel));
				setSelection({
					...vectorMatch,
					coordinate: evt.coordinate,
					displayMode: "overlay",
				});
				return;
			}

			if (wmsLayerIds.length > 0) {
				setIsLoading(true);
				document.body.style.cursor = "wait";

				try {
					const wmsMatch = await findWmsFeature(evt.coordinate);
					if (wmsMatch) {
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

			{isLoading && (
				<div className="pointer-events-none fixed right-4 bottom-4 animate-pulse rounded bg-white/80 p-2 text-xs shadow-sm">
					Lade Feature-Info...
				</div>
			)}
		</>
	);
};

export default ClickControl;
