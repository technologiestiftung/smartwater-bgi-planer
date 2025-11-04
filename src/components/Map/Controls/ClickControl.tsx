/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMapStore } from "@/store/map";
import Overlay, { Options } from "ol/Overlay.js";
import {
	cloneElement,
	FC,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

interface ClickControlChildProps {
	features: any;
	layerId: string;
	onClose: () => void;
}

interface ClickControlProps {
	layerId: string;
	overlayOptions?: Options;
	children: React.ReactElement<Partial<ClickControlChildProps>>;
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
	layerId,
	overlayOptions,
	children,
	minZoomForClick = 4,
}) => {
	const map = useMapStore((state) => state.map);
	const overlayRef = useRef<HTMLDivElement>(null);
	const overlayInstanceRef = useRef<Overlay | null>(null);
	const overlaySizeRef = useRef({ width: 0, height: 0 });

	const [features, setFeatures] = useState<any>();
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

	const handleCloseOverlay = useCallback(() => {
		if (overlayInstanceRef.current) {
			overlayInstanceRef.current.setPosition(undefined);
		}
		setFeatures(undefined);
	}, []);

	// Update overlay positioning when cardPosition changes
	useEffect(() => {
		if (overlayInstanceRef.current) {
			overlayInstanceRef.current.setPositioning(cardPosition);
			overlayInstanceRef.current.setOffset(POSITION_OFFSETS[cardPosition]);
		}
	}, [cardPosition]);

	// Track overlay size with ResizeObserver
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

	// Main map click handler
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
			const zoom = map.getView().getZoom() ?? 0;
			if (zoom < minZoomForClick) return;

			const pixel = evt.pixel;
			const coordinate = evt.coordinate;
			let matchedFeature = null;

			const newPositioning = calculatePositioning(pixel);
			if (newPositioning !== cardPosition) {
				setCardPosition(newPositioning);
			}

			map.forEachFeatureAtPixel(pixel, (feature, layer) => {
				if (layer?.get("id") === layerId) {
					const clusteredFeatures = feature.get("features");
					const isCluster = clusteredFeatures?.length > 1;

					if (!isCluster) {
						matchedFeature = feature;
					}
					return true;
				}
			});

			if (matchedFeature) {
				overlay.setPosition(coordinate);
				setFeatures(matchedFeature);
			} else {
				overlay.setPosition(undefined);
				setFeatures(undefined);
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
		layerId,
		overlayOptions,
		cardPosition,
		calculatePositioning,
		minZoomForClick,
	]);

	return (
		<div className="ClickControl-root" ref={overlayRef}>
			{features &&
				cloneElement(children, {
					features,
					layerId,
					onClose: handleCloseOverlay,
				})}
		</div>
	);
};

export default ClickControl;
