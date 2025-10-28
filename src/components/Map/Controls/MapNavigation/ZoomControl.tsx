"use client";

import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/map";
import Image from "next/image";
import { FC, useCallback, useEffect } from "react";

const ZoomControl: FC = () => {
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
		<div className="ZoomControl-root hidden md:flex flex-col bg-white rounded-[2px] p-2 gap-2 items-center justify-center shadow-[0_0_8px_0_rgba(0,0,0,0.24)]">
			<Button
				variant="map-zoom"
				size={null}
				onClick={handleZoomIn}
				className="cursor-pointer"
			>
				<Image src="/icons/plus.svg" alt="Zoom in" width={24} height={24} />
			</Button>
			<div className="h-px px-1 w-full">
				<div className="h-full bg-gray-300 w-full" />
			</div>
			<Button
				variant="map-zoom"
				size={null}
				onClick={handleZoomOut}
				className="cursor-pointer"
			>
				<Image src="/icons/minus.svg" alt="Zoom out" width={24} height={24} />
			</Button>
		</div>
	);
};

export default ZoomControl;
