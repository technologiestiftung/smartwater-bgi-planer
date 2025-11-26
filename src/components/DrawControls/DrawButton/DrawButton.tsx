"use client";

import { Button } from "@/components/ui/button";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import { PolygonIcon } from "@phosphor-icons/react";
import Draw from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import { FC, useEffect, useRef } from "react";

interface DrawButtonProps {
	geometryType?: "Point" | "LineString" | "Polygon" | "Circle";
}

const DrawButton: FC<DrawButtonProps> = ({ geometryType = "Polygon" }) => {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);
	const isDrawing = useUiStore((state) => state.isDrawing);
	const setIsDrawing = useUiStore((state) => state.setIsDrawing);
	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);

	const drawRef = useRef<Draw | null>(null);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		setLayerVisibility(drawLayerId, true);
	}, [map, drawLayerId, setLayerVisibility]);

	useEffect(() => {
		if (!map || !drawLayerId) return;

		const removeDrawInteraction = () => {
			if (drawRef.current) {
				map.removeInteraction(drawRef.current);
				drawRef.current = null;
			}
		};
		removeDrawInteraction();

		return () => {
			removeDrawInteraction();
		};
	}, [map, drawLayerId]);

	useEffect(() => {
		if (!isDrawing && drawRef.current && map) {
			map.removeInteraction(drawRef.current);
			drawRef.current = null;
		}
	}, [isDrawing, map]);

	const toggleDraw = () => {
		if (!map) return;

		if (drawRef.current) {
			map.removeInteraction(drawRef.current);
			drawRef.current = null;
			setIsDrawing(false);
			return;
		}

		resetDrawInteractions();

		const layer = map
			.getAllLayers()
			.find((l) => l.get("id") === drawLayerId) as VectorLayer<VectorSource>;

		if (!layer || !(layer.getSource() instanceof VectorSource)) {
			console.error("Layer not found or is not a vector layer");
			return;
		}

		drawRef.current = new Draw({
			source: layer.getSource()!,
			type: geometryType,
		});

		map.addInteraction(drawRef.current);
		setIsDrawing(true);
	};

	return (
		<Button variant="outline" onClick={toggleDraw}>
			<PolygonIcon />
			{isDrawing ? "Stop Zeichnen" : "Zeichnen"}
		</Button>
	);
};

export default DrawButton;
