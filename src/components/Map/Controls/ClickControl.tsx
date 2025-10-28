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

interface ClickControlProps {
	layerId: string;
	overlayOptions?: any;
	children: React.ReactElement;
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
	const overlaySizeRef = useRef({ width: 0, height: 0 });

	const [features, setFeatures] = useState<any>();
	const [cardPosition, setCardPosition] =
		useState<OverlayPositioning>("bottom-left");
	const [overlayReady, setOverlayReady] = useState(false);

	const hideOverlay = useCallback((overlay: Overlay) => {
		overlay.setPosition(undefined);
		setFeatures(undefined);
	}, []);

	const showOverlay = useCallback(
		(overlay: Overlay, coordinate: any, feature: any) => {
			overlay.setPosition(coordinate);
			setFeatures(feature);
		},
		[],
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
			id: "ClickControl-root",
			positioning: cardPosition,
			offset: cardOffset,
			...overlayOptions,
		});

		map.addOverlay(overlay);

		const handleClick = (evt: any) => {
			const zoom = Math.max(0, map.getView().getZoom() ?? 0);
			if (zoom < minZoomForClick) {
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

		map.on("click", handleClick);

		return () => {
			map.un("click", handleClick);
			map.removeOverlay(overlay);
		};
	}, [
		map,
		layerId,
		overlayOptions,
		cardPosition,
		calculatePositioning,
		minZoomForClick,
		hideOverlay,
		showOverlay,
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

	const handleCloseOverlay = useCallback(() => {
		setFeatures(undefined);
	}, []);

	return (
		<div
			className="ClickControl-root"
			ref={overlayRef}
			style={{
				visibility: overlayReady ? "visible" : "hidden",
			}}
		>
			{features &&
				children &&
				cloneElement(children as React.ReactElement<any>, {
					features,
					layerId,
					onClose: handleCloseOverlay,
				})}
		</div>
	);
};

export default ClickControl;
