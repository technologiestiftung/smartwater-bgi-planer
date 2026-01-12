"use client";

import { fetchFeatureInfo } from "@/lib/helpers/wmsFeatureInfo";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import Overlay from "ol/Overlay.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import FeatureTooltip from "./FeatureTooltip";

interface FeatureDisplayControlProps {
	queryableLayerIds: string[];
}

const FeatureDisplayControl: FC<FeatureDisplayControlProps> = ({
	queryableLayerIds,
}) => {
	const map = useMapStore((state) => state.map);
	const isDrawing = useUiStore((state) => state.isDrawing);
	const isBlockAreaSelecting = useUiStore(
		(state) => state.isBlockAreaSelecting,
	);
	const isDrawingNote = useUiStore((state) => state.isDrawingNote);

	const overlayRef = useRef<HTMLDivElement>(null);
	const overlayInstanceRef = useRef<Overlay | null>(null);

	const [featureData, setFeatureData] = useState<{
		attributes: Record<string, any>;
		layerId: string;
		coordinate: [number, number];
	} | null>(null);

	const handleCloseTooltip = useCallback(() => {
		setFeatureData(null);
	}, []);

	useEffect(() => {
		if (!featureData && overlayInstanceRef.current) {
			overlayInstanceRef.current.setPosition(undefined);
		}
	}, [featureData]);

	useEffect(() => {
		if (!map || !overlayRef.current || queryableLayerIds.length === 0) return;

		const overlay = new Overlay({
			element: overlayRef.current,
			id: "FeatureDisplayControl-overlay",
			positioning: "bottom-left",
			offset: [10, -10],
		});

		overlayInstanceRef.current = overlay;
		map.addOverlay(overlay);

		const handleClick = async (evt: any) => {
			// Don't interfere with drawing interactions
			if (isDrawing || isBlockAreaSelecting || isDrawingNote) {
				return;
			}

			const coordinate = evt.coordinate;

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
						overlay.setPosition(coordinate);
					} else {
						// Clear any existing tooltip if no features found
						handleCloseTooltip();
					}
				} catch (error) {
					console.error("Error fetching feature info:", error);
					handleCloseTooltip();
				}
			} else {
				// Click was not on a queryable layer, close tooltip
				handleCloseTooltip();
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
		queryableLayerIds,
		isDrawing,
		isBlockAreaSelecting,
		isDrawingNote,
		handleCloseTooltip,
	]);

	return (
		<div className="FeatureDisplayControl-root" ref={overlayRef}>
			{featureData ? (
				<FeatureTooltip
					attributes={featureData.attributes}
					layerId={featureData.layerId}
					onClose={handleCloseTooltip}
				/>
			) : null}
		</div>
	);
};

export default FeatureDisplayControl;
