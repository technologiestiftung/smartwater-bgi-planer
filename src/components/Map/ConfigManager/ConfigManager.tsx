"use client";

import { useMapStore } from "@/store/map";
import { FC, useEffect } from "react";

interface ConfigManagerProps {}

const ConfigManager: FC<ConfigManagerProps> = ({}) => {
	const setMapView = useMapStore((state) => state.setMapView);
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
					setMapView({
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
	}, [map, setMapView]);

	return null;
};

export default ConfigManager;
