"use client";

import { Button } from "@/components/ui/button";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import GeoJSON from "ol/format/GeoJSON.js";
import Draw from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import { FC, useEffect, useRef, useState } from "react";

interface DrawNoteButtonProps {
	layerId: string;
}

const DrawNoteButton: FC<DrawNoteButtonProps> = ({ layerId }) => {
	const map = useMapStore((state) => state.map);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);

	const drawRef = useRef<Draw | null>(null);
	const [isDrawing, setIsDrawing] = useState(false);

	useEffect(() => {
		if (!map || !layerId) return;

		setLayerVisibility(layerId, true);
	}, [layerId, map, setLayerVisibility]);

	useEffect(() => {
		return () => {
			if (map && drawRef.current) {
				map.removeInteraction(drawRef.current);
				drawRef.current = null;
				setIsDrawing(false);
			}
		};
	}, [map]);

	const toggleDraw = () => {
		if (!map) return;

		if (drawRef.current) {
			map.removeInteraction(drawRef.current);
			drawRef.current = null;
			setIsDrawing(false);
			return;
		}

		const layer = map
			.getAllLayers()
			.find((l) => l.get("id") === layerId) as VectorLayer<VectorSource>;

		if (!layer || !(layer.getSource() instanceof VectorSource)) {
			console.error("Layer not found or is not a vector layer");
			return;
		}

		drawRef.current = new Draw({
			source: layer.getSource()!,
			type: "Point",
		});

		drawRef.current.on("drawend", (event) => {
			const geojson = new GeoJSON().writeFeatureObject(event.feature);
			console.log("GeoJSON:", geojson);

			// open modal or overlay to add note text
		});

		map.addInteraction(drawRef.current);
		setIsDrawing(true);
	};

	return (
		<Button onClick={toggleDraw}>{isDrawing ? "Stop Drawing" : "Notiz"}</Button>
	);
};

export default DrawNoteButton;
