"use client";

import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import Overlay, { Options } from "ol/Overlay.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";

interface ClickControlProps {
	layerIds: string[];
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
		if (!features && overlayInstanceRef.current) {
			overlayInstanceRef.current.setPosition(undefined);
		}
	}, [features]);

	const handleCloseOverlay = useCallback(() => {
		setFeatures(undefined);
		setMatchedLayerId(null);
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

		const handleClick = (evt: any) => {
			if (isDrawing || isBlockAreaSelecting) {
				return;
			}

			const zoom = map.getView().getZoom() ?? 0;
			if (zoom < minZoomForClick) return;

			const pixel = evt.pixel;
			const coordinate = evt.coordinate;
			let matchedFeature = null;
			let matchedLayer = null;

			const newPositioning = calculatePositioning(pixel);
			if (newPositioning !== cardPosition) {
				setCardPosition(newPositioning);
			}

			map.forEachFeatureAtPixel(pixel, (feature, layer) => {
				const currentLayerId = layer?.get("id");
				if (layerIds.includes(currentLayerId)) {
					const clusteredFeatures = feature.get("features");
					const isCluster = clusteredFeatures?.length > 1;

					if (!isCluster) {
						matchedFeature = feature;
						matchedLayer = currentLayerId;
					}
					return true;
				}
			});

			if (matchedFeature && matchedLayer) {
				overlay.setPosition(coordinate);
				setFeatures(matchedFeature);
				setMatchedLayerId(matchedLayer);
			} else {
				overlay.setPosition(undefined);
				setFeatures(undefined);
				setMatchedLayerId(null);
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
		overlayOptions,
		cardPosition,
		calculatePositioning,
		minZoomForClick,
		isDrawing,
		isBlockAreaSelecting,
		isDrawingNote,
	]);

	return (
		<div className="ClickControl-root" ref={overlayRef}>
			{features && matchedLayerId
				? renderContent(features, matchedLayerId, handleCloseOverlay)
				: null}
		</div>
	);
};

export default ClickControl;
