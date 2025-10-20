"use client";

import { Button } from "@/components/ui/button";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import Draw from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import { FC, useEffect, useRef, useState } from "react";

interface DrawButtonProps {
	geometryType?: "Point" | "LineString" | "Polygon" | "Circle";
}

const DrawButton: FC<DrawButtonProps> = ({ geometryType = "Polygon" }) => {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);

	const drawRef = useRef<Draw | null>(null);
	const [isDrawing, setIsDrawing] = useState(false);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		setLayerVisibility(drawLayerId, true);
	}, [map, drawLayerId, setLayerVisibility]);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		if (drawRef.current) {
			map.removeInteraction(drawRef.current);
			drawRef.current = null;
			setIsDrawing(false);
		}

		return () => {
			if (drawRef.current) {
				map.removeInteraction(drawRef.current);
				drawRef.current = null;
				setIsDrawing(false);
			}
		};
	}, [map, drawLayerId]);

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
			.find((l) => l.get("id") === drawLayerId) as VectorLayer<VectorSource>;

		if (!layer || !(layer.getSource() instanceof VectorSource)) {
			console.error("Layer not found or is not a vector layer");
			return;
		}

		const layerStyle = layer.getStyle();

		drawRef.current = new Draw({
			source: layer.getSource()!,
			type: geometryType,
			...(layerStyle && { style: layerStyle }),
		});

		map.addInteraction(drawRef.current);
		setIsDrawing(true);
	};

	return (
		<Button onClick={toggleDraw}>
			{isDrawing ? "Stop Zeichnen" : "Zeichnen"}
		</Button>
	);
};

export default DrawButton;
