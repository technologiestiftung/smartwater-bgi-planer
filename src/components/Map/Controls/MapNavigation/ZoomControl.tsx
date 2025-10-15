"use client";

import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/map";
import { MinusIcon, PlusIcon } from "lucide-react";
import { FC, ReactNode, useCallback, useEffect } from "react";

interface ZoomControlProps {
	zoomInIcon?: ReactNode;
	zoomOutIcon?: ReactNode;
}

const ZoomControl: FC<ZoomControlProps> = ({
	zoomInIcon = <PlusIcon />,
	zoomOutIcon = <MinusIcon />,
}) => {
	const map = useMapStore((state) => state.map);

	const handleZoomIn = useCallback(() => {
		if (!map) return;
		const view = map.getView();
		const zoom = view.getZoom();
		if (zoom !== undefined) {
			view.animate({ zoom: zoom + 1, duration: 250 });
		}
	}, [map]);

	const handleZoomOut = useCallback(() => {
		if (!map) return;
		const view = map.getView();
		const zoom = view.getZoom();
		if (zoom !== undefined) {
			view.animate({ zoom: zoom - 1, duration: 250 });
		}
	}, [map]);

	// Remove default zoom control
	useEffect(() => {
		if (!map) return;

		const existingControls = map.getControls().getArray();
		existingControls.forEach((control) => {
			if (control.constructor.name === "Zoom") {
				map.removeControl(control);
			}
		});
	}, [map]);

	if (!map) return null;

	return (
		<div className="hidden md:flex flex-col gap-2" data-testid="zoom-controls">
			<Button
				variant="map-icon"
				size="icon-only"
				onClick={handleZoomIn}
				className="cursor-pointer"
				data-testid="zoom-in-button"
			>
				{zoomInIcon}
			</Button>
			<Button
				variant="map-icon"
				size="icon-only"
				onClick={handleZoomOut}
				className="cursor-pointer"
				data-testid="zoom-out-button"
			>
				{zoomOutIcon}
			</Button>
		</div>
	);
};

export default ZoomControl;
