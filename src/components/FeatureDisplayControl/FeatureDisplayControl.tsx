"use client";

import { fetchFeatureInfo } from "@/lib/helpers/wmsFeatureInfo";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import Overlay from "ol/Overlay.js";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FeatureTooltip from "./FeatureTooltip";

interface FeatureDisplayControlProps {
	queryableLayerIds: string[];
}

type OverlayPositioning =
	| "bottom-left"
	| "bottom-right"
	| "top-left"
	| "top-right";

const POSITION_OFFSETS: Record<OverlayPositioning, [number, number]> = {
	"top-left": [10, 10],
	"top-right": [-10, 10],
	"bottom-left": [10, -10],
	"bottom-right": [-10, -10],
};

const FeatureDisplayControl: FC<FeatureDisplayControlProps> = ({
	queryableLayerIds,
}) => {
	const map = useMapStore((state) => state.map);
	const isDrawing = useUiStore((state) => state.isDrawing);
	const isBlockAreaSelecting = useUiStore(
		(state) => state.isBlockAreaSelecting,
	);
	const isDrawingNote = useUiStore((state) => state.isDrawingNote);

	const [cardPosition, setCardPosition] =
		useState<OverlayPositioning>("bottom-left");
	const [featureData, setFeatureData] = useState<{
		attributes: Record<string, any>;
		layerId: string;
		coordinate: [number, number];
	} | null>(null);

	const overlayContainer = useMemo(() => {
		if (typeof document === "undefined") return null;
		return document.createElement("div");
	}, []);

	const overlayInstanceRef = useRef<Overlay | null>(null);
	const overlaySizeRef = useRef({ width: 0, height: 0 });

	const calculatePositioning = useCallback(
		(pixel: [number, number]): OverlayPositioning => {
			if (!map) return "bottom-left";
			const mapSize = map.getSize();
			if (!mapSize) return "bottom-left";

			const { width: overlayWidth, height: overlayHeight } =
				overlaySizeRef.current;
			const effectiveWidth = overlayWidth || 300;
			const effectiveHeight = overlayHeight || 200;

			const [mapWidth, mapHeight] = mapSize;
			const [pixelX, pixelY] = pixel;
			const buffer = 10;

			const vertical: "top" | "bottom" =
				pixelY + effectiveHeight + buffer > mapHeight ? "bottom" : "top";
			const horizontal: "left" | "right" =
				pixelX + effectiveWidth + buffer > mapWidth ? "right" : "left";

			return `${vertical}-${horizontal}` as OverlayPositioning;
		},
		[map],
	);

	useEffect(() => {
		if (overlayInstanceRef.current) {
			overlayInstanceRef.current.setPositioning(cardPosition);
			overlayInstanceRef.current.setOffset(POSITION_OFFSETS[cardPosition]);
		}
	}, [cardPosition]);

	const handleCloseTooltip = useCallback(() => {
		setFeatureData(null);
		overlayInstanceRef.current?.setPosition(undefined);
	}, []);

	useEffect(() => {
		if (!overlayContainer) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				overlaySizeRef.current = { width, height };
			}
		});
		observer.observe(overlayContainer);
		return () => observer.disconnect();
	}, [overlayContainer]);

	const handleClick = useCallback(
		async (evt: any) => {
			if (isDrawing || isBlockAreaSelecting || isDrawingNote || !map) return;

			const pixel = evt.pixel;
			const coordinate = evt.coordinate;

			const newPositioning = calculatePositioning(pixel);

			setCardPosition((prev) =>
				prev === newPositioning ? prev : newPositioning,
			);

			let clickedLayerId: string | null = null;
			const allLayers = map.getAllLayers();

			for (const layer of allLayers) {
				const layerId = layer.get("id");
				if (
					layerId &&
					queryableLayerIds.includes(layerId) &&
					layer.getVisible()
				) {
					clickedLayerId = layerId;
					break;
				}
			}

			if (clickedLayerId) {
				try {
					const result = await fetchFeatureInfo({
						coordinate,
						layerId: clickedLayerId,
						map,
					});
					if (result.attributes) {
						setFeatureData({
							attributes: result.attributes,
							layerId: clickedLayerId,
							coordinate,
						});
						overlayInstanceRef.current?.setPosition(coordinate);
					} else {
						handleCloseTooltip();
					}
				} catch (error) {
					console.error("Error fetching feature info:", error);
					handleCloseTooltip();
				}
			} else {
				handleCloseTooltip();
			}
		},
		[
			isDrawing,
			isBlockAreaSelecting,
			isDrawingNote,
			calculatePositioning,
			map,
			queryableLayerIds,
			handleCloseTooltip,
		],
	);

	useEffect(() => {
		if (!map || !overlayContainer || queryableLayerIds.length === 0) return;

		const overlay = new Overlay({
			element: overlayContainer,
			id: "FeatureDisplayControl-overlay",
			positioning: "bottom-left",
			stopEvent: true,
		});

		overlayInstanceRef.current = overlay;
		map.addOverlay(overlay);
		map.on("click", handleClick);

		return () => {
			map.un("click", handleClick);
			if (overlayInstanceRef.current) {
				map.removeOverlay(overlayInstanceRef.current);
			}
			overlayInstanceRef.current = null;
		};
	}, [map, queryableLayerIds, handleClick, overlayContainer]);

	if (!overlayContainer || !featureData) return null;

	return createPortal(
		<div className="FeatureDisplayControl-root">
			<FeatureTooltip
				attributes={featureData.attributes}
				layerId={featureData.layerId}
				onClose={handleCloseTooltip}
			/>
		</div>,
		overlayContainer,
	);
};

export default FeatureDisplayControl;
