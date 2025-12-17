"use client";

import { useMapStore } from "@/store/map";
import { FC, useEffect } from "react";

interface MapManagerProps {}

const MapManager: FC<MapManagerProps> = ({}) => {
	const updateConfig = useMapStore((state) => state.updateConfig);
	const map = useMapStore((state) => state.map);

	useEffect(() => {
		if (!map) return;

		const view = map.getView();
		let updateTimeout: ReturnType<typeof setTimeout>;

		const handleViewChange = () => {
			clearTimeout(updateTimeout);
			updateTimeout = setTimeout(() => {
				const newCenter = view.getCenter();
				const newZoom = view.getZoom();

				if (newCenter && newZoom !== undefined) {
					updateConfig({
						startCenter: newCenter,
						startZoomLevel: newZoom,
					});
				}
			}, 1000);
		};

		view.on("change:center", handleViewChange);
		view.on("change:resolution", handleViewChange);

		return () => {
			clearTimeout(updateTimeout);
			view.un("change:center", handleViewChange);
			view.un("change:resolution", handleViewChange);
		};
	}, [map, updateConfig]);

	return null;
};

export default MapManager;
