"use client";

import { useMapStore } from "@/store/map";
import { FC, useEffect } from "react";

interface ConfigManagerProps {}

const ConfigManager: FC<ConfigManagerProps> = ({}) => {
	const updateConfig = useMapStore((state) => state.updateConfig);
	const map = useMapStore((state) => state.map);
	const setMapView = useMapStore((state) => state.setMapView);

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
					setMapView({ startCenter: newCenter, startZoomLevel: newZoom });
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
	}, [map, updateConfig, setMapView]);

	return null;
};

export default ConfigManager;
