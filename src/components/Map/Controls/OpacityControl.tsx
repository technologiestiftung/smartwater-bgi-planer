"use client";

import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useEffect } from "react";

const TARGET_LAYER_IDS = [
	"bgi-planer:cc_ua_phk_bioklim_str_tag_2022",
	"bgi-planer:cb_ua_phk_bioklim_siedl_tag_2022",
	"bgi-planer:ca_ua_phk_aufenth_grfrei_tag_2022",
	"bgi-planer:dc_ua_phk_bioklim_siedl_nacht_2022",
	"bgi-planer:dd_ua_phk_bioklim_str_nacht_2022",
];

const ZOOM_OPACITY_MAP: Record<number, number> = {
	5: 0.5,
	4: 0.5,
};

const OpacityControl = () => {
	const map = useMapStore((state) => state.map);
	const layers = useLayersStore((state) => state.layers);

	useEffect(() => {
		if (!map) return;
		const view = map.getView();
		if (!view) return;

		const handleZoom = () => {
			const zoom = view.getZoom();
			const zoomInt = typeof zoom === "number" ? Math.floor(zoom) : undefined;
			const opacity =
				zoomInt !== undefined ? (ZOOM_OPACITY_MAP[zoomInt] ?? 1) : 1;
			map.getLayers().forEach((layer) => {
				const layerId = layer.get("id");
				if (TARGET_LAYER_IDS.includes(layerId)) {
					layer.setOpacity(opacity);
				}
			});
		};

		handleZoom();
		view.on("change:resolution", handleZoom);

		return () => {
			view.un("change:resolution", handleZoom);
		};
	}, [map, layers]);

	return null;
};

export default OpacityControl;
