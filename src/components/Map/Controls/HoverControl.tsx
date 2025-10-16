/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMapStore } from "@/store/map";
import Overlay from "ol/Overlay.js";
import {
	cloneElement,
	FC,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

interface HoverControlProps {
	layerId: string;
	overlayOptions?: any;
	children: React.ReactElement;
	minZoomForHover?: number;
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

const HoverControl: FC<HoverControlProps> = ({
	layerId,
	overlayOptions,
	children,
	minZoomForHover = 4,
}) => {
	const map = useMapStore((state) => state.map);
	const overlayRef = useRef<HTMLDivElement>(null);
	const overlaySizeRef = useRef({ width: 0, height: 0 });
	const showTimeoutRef = useRef<number | null>(null);
	const hideTimeoutRef = useRef<number | null>(null);

	const [features, setFeatures] = useState<any>();
	const [cardPosition, setCardPosition] =
		useState<OverlayPositioning>("bottom-left");
	const [overlayReady, setOverlayReady] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const clearTimeouts = useCallback(() => {
		if (showTimeoutRef.current) {
			clearTimeout(showTimeoutRef.current as number);
			showTimeoutRef.current = null;
		}
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current as number);
			hideTimeoutRef.current = null;
		}
	}, []);

	const hideOverlay = useCallback(
		(overlay: Overlay, immediate = false) => {
			clearTimeouts();

			if (immediate) {
				overlay.setPosition(undefined);
				setFeatures(undefined);
				setIsVisible(false);
			} else {
				setIsVisible(false);
				hideTimeoutRef.current = setTimeout(() => {
					overlay.setPosition(undefined);
					setFeatures(undefined);
				}, 200) as unknown as number;
			}
		},
		[clearTimeouts],
	);

	const showOverlay = useCallback(
		(overlay: Overlay, coordinate: any, feature: any) => {
			clearTimeouts();

			overlay.setPosition(coordinate);
			if (features !== feature) {
				setFeatures(feature);
			}

			showTimeoutRef.current = setTimeout(() => {
				setIsVisible(true);
			}, 50) as unknown as number;
		},
		[clearTimeouts, features],
	);

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

	const updateOverlaySize = useCallback(() => {
		if (!overlayRef.current) return;

		requestAnimationFrame(() => {
			const rect = overlayRef.current?.getBoundingClientRect();
			if (rect) {
				overlaySizeRef.current = { width: rect.width, height: rect.height };
				setOverlayReady(true);
			}
		});
	}, []);

	useEffect(() => {
		if (!map || !overlayRef.current) return;

		const cardOffset = POSITION_OFFSETS[cardPosition];
		const overlay = new Overlay({
			element: overlayRef.current,
			id: "HoverControl-root",
			positioning: cardPosition,
			offset: cardOffset,
			...overlayOptions,
		});

		map.addOverlay(overlay);

		const handlePointerMove = (evt: any) => {
			const zoom = Math.max(0, map.getView().getZoom() ?? 0);
			if (zoom < minZoomForHover) {
				hideOverlay(overlay, true);
				return;
			}

			const pixel = evt.pixel;
			const coordinate = evt.coordinate;
			let matchedFeature = null;

			const newPositioning = calculatePositioning(pixel);
			if (newPositioning !== cardPosition) {
				setCardPosition(newPositioning);
			}

			map.forEachFeatureAtPixel(pixel, function (feature, layer) {
				if (layer && layer.get("id") === layerId) {
					const clusteredFeatures = feature.get("features");
					const isCluster = clusteredFeatures && clusteredFeatures.length > 1;

					if (!isCluster) {
						matchedFeature = feature;
					}
					return true;
				}
			});

			if (matchedFeature) {
				showOverlay(overlay, coordinate, matchedFeature);
			} else {
				hideOverlay(overlay);
			}
		};

		const handleZoomChange = () => {
			const zoom = Math.max(0, map.getView().getZoom() ?? 0);
			if (zoom < minZoomForHover) {
				hideOverlay(overlay, true);
			}
		};

		map.on("pointermove", handlePointerMove);
		map.getView().on("change:resolution", handleZoomChange);

		return () => {
			clearTimeouts();
			map.un("pointermove", handlePointerMove);
			map.getView().un("change:resolution", handleZoomChange);
			map.removeOverlay(overlay);
		};
	}, [
		map,
		layerId,
		overlayOptions,
		cardPosition,
		calculatePositioning,
		features,
		minZoomForHover,
		hideOverlay,
		showOverlay,
		clearTimeouts,
	]);

	useEffect(updateOverlaySize, [features, updateOverlaySize]);

	useEffect(() => {
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				overlaySizeRef.current = { width, height };
			}
		});

		if (overlayRef.current) {
			observer.observe(overlayRef.current);
		}

		return () => observer.disconnect();
	}, []);

	return (
		<div
			className="HoverControl-root"
			ref={overlayRef}
			style={{
				visibility: overlayReady ? "visible" : "hidden",
				opacity: isVisible ? 1 : 0,
				transition: "opacity 200ms ease-out",
			}}
		>
			{features &&
				children &&
				cloneElement(children as React.ReactElement<any>, {
					features,
				})}
		</div>
	);
};

export default HoverControl;
