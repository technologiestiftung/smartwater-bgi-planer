"use client";

import { useMapStore } from "@/store/map";
import { FullScreen } from "ol/control";
import { FC, useEffect } from "react";

const FullScreenControl: FC = () => {
	const map = useMapStore((state) => state.map);

	useEffect(() => {
		if (!map) return;

		const fullScreenControl = new FullScreen({});
		map.addControl(fullScreenControl);

		return () => {
			if (map) {
				map.removeControl(fullScreenControl);
			}
		};
	}, [map]);

	return null;
};

export default FullScreenControl;
