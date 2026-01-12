"use client";

import { fetchFeatureInfo } from "@/lib/helpers/wmsFeatureInfo";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import Overlay from "ol/Overlay.js";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FeatureModal from "./FeatureModal"; // Import your modal
import FeatureTooltip from "./FeatureTooltip";

type DisplayType = "tooltip" | "modal";

interface FeatureDisplayControlProps {
	queryableLayerIds: string[];
	layerDisplayConfigs?: Record<string, DisplayType>;
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
	layerDisplayConfigs = {},
}) => {
	const map = useMapStore((state) => state.map);
	const isDrawing = useUiStore((state) => state.isDrawing);
	const isBlockAreaSelecting = useUiStore(
		(state) => state.isBlockAreaSelecting,
	);
	const isDrawingNote = useUiStore((state) => state.isDrawingNote);

	const [cardPosition, setCardPosition] =
		useState<OverlayPositioning>("bottom-left");

	const [tooltipData, setTooltipData] = useState<{
		attributes: Record<string, any>;
		layerId: string;
	} | null>(null);

	const [modalData, setModalData] = useState<{
		attributes: Record<string, any>;
		layerId: string;
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
			const { width, height } = overlaySizeRef.current;
			const [mapW, mapH] = mapSize;
			const [x, y] = pixel;
			const buffer = 10;
			const v: "top" | "bottom" =
				y + (height || 200) + buffer > mapH ? "bottom" : "top";
			const h: "left" | "right" =
				x + (width || 300) + buffer > mapW ? "right" : "left";
			return `${v}-${h}` as OverlayPositioning;
		},
		[map],
	);

	useEffect(() => {
		if (overlayInstanceRef.current) {
			overlayInstanceRef.current.setPositioning(cardPosition);
			overlayInstanceRef.current.setOffset(POSITION_OFFSETS[cardPosition]);
		}
	}, [cardPosition]);

	const handleCloseAll = useCallback(() => {
		setTooltipData(null);
		setModalData(null);
		overlayInstanceRef.current?.setPosition(undefined);
	}, []);

	const handleClick = useCallback(
		async (evt: any) => {
			if (isDrawing || isBlockAreaSelecting || isDrawingNote || !map) return;

			const { pixel, coordinate } = evt;

			const activeLayers = map
				.getAllLayers()
				.filter((l) => {
					const id = l.get("id");
					return id && queryableLayerIds.includes(id) && l.getVisible();
				})
				.reverse();

			if (activeLayers.length === 0) {
				handleCloseAll();
				return;
			}

			let foundData = false;

			for (const layer of activeLayers) {
				const clickedLayerId = layer.get("id");

				try {
					const result = await fetchFeatureInfo({
						coordinate,
						layerId: clickedLayerId,
						map,
					});

					if (result.attributes && Object.keys(result.attributes).length > 0) {
						const displayType =
							layerDisplayConfigs[clickedLayerId] || "tooltip";

						if (displayType === "modal") {
							setTooltipData(null);
							overlayInstanceRef.current?.setPosition(undefined);
							setModalData({
								attributes: result.attributes,
								layerId: clickedLayerId,
							});
						} else {
							setModalData(null);
							const newPos = calculatePositioning(pixel);
							setCardPosition(newPos);
							setTooltipData({
								attributes: result.attributes,
								layerId: clickedLayerId,
							});
							overlayInstanceRef.current?.setPosition(coordinate);
						}

						foundData = true;
						break;
					}
				} catch (error) {
					console.error(`Error querying layer ${clickedLayerId}:`, error);
				}
			}

			if (!foundData) {
				handleCloseAll();
			}
		},
		[
			isDrawing,
			isBlockAreaSelecting,
			isDrawingNote,
			map,
			queryableLayerIds,
			layerDisplayConfigs,
			calculatePositioning,
			handleCloseAll,
		],
	);

	useEffect(() => {
		if (!map || !overlayContainer || queryableLayerIds.length === 0) return;
		const overlay = new Overlay({
			element: overlayContainer,
			positioning: "bottom-left",
			stopEvent: true,
		});
		overlayInstanceRef.current = overlay;
		map.addOverlay(overlay);
		map.on("click", handleClick);
		return () => {
			map.un("click", handleClick);
			map.removeOverlay(overlay);
		};
	}, [map, queryableLayerIds, handleClick, overlayContainer]);

	useEffect(() => {
		if (!overlayContainer) return;
		const obs = new ResizeObserver((entries) => {
			const rect = entries[0].contentRect;
			overlaySizeRef.current = { width: rect.width, height: rect.height };
		});
		obs.observe(overlayContainer);
		return () => obs.disconnect();
	}, [overlayContainer]);

	return (
		<>
			{/* 1. Map Overlay (Portal) */}
			{overlayContainer &&
				tooltipData &&
				createPortal(
					<FeatureTooltip
						attributes={tooltipData.attributes}
						layerId={tooltipData.layerId}
						onClose={handleCloseAll}
					/>,
					overlayContainer,
				)}

			{/* 2. Global Modal (Standard React Tree) */}
			{modalData && (
				<FeatureModal
					attributes={modalData.attributes}
					layerId={modalData.layerId}
					onClose={handleCloseAll}
				/>
			)}
		</>
	);
};

export default FeatureDisplayControl;
