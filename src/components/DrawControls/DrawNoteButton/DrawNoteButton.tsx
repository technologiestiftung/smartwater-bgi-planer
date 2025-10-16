"use client";

import { Button } from "@/components/ui/button";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import GeoJSON from "ol/format/GeoJSON.js";
import Draw from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import { FC, useEffect, useRef } from "react";

interface DrawNoteButtonProps {
	layerId: string;
}

const DrawNoteButton: FC<DrawNoteButtonProps> = ({ layerId }) => {
	const map = useMapStore((state) => state.map);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);

	const drawRef = useRef<Draw | null>(null);

	useEffect(() => {
		if (!map || !layerId) return;
		console.log("[DrawButton] layerId::", layerId);

		setLayerVisibility(layerId, true);
	}, [layerId, map, setLayerVisibility]);

	const toggleDraw = () => {
		if (!map) return;

		// Remove existing draw interaction
		if (drawRef.current) {
			map.removeInteraction(drawRef.current);
			drawRef.current = null;
			return;
		}

		// Find the layer by ID
		const layer = map
			.getAllLayers()
			.find((l) => l.get("id") === layerId) as VectorLayer<VectorSource>;

		if (!layer || !(layer.getSource() instanceof VectorSource)) {
			console.error("Layer not found or is not a vector layer");
			return;
		}

		// Add draw interaction
		drawRef.current = new Draw({
			source: layer.getSource()!,
			type: "Point",
		});

		drawRef.current.on("drawend", (event) => {
			const feature = event.feature;
			// Feature is automatically added to the source
			// You can access it here if needed:
			console.log("Feature drawn:", feature);
			console.log("Geometry:", feature.getGeometry());
		});

		drawRef.current.on("drawend", (event) => {
			const geojson = new GeoJSON().writeFeatureObject(event.feature);
			console.log("GeoJSON:", geojson);

			// Send to backend, save to state, etc.
		});

		map.addInteraction(drawRef.current);
	};

	return (
		<Button onClick={toggleDraw}>
			{drawRef.current ? "Stop Drawing" : "Notiz"}
		</Button>
	);
};

export default DrawNoteButton;
