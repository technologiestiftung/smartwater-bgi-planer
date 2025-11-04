/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { NoteIcon } from "@phosphor-icons/react";
import Draw from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import MapBrowserEvent from "ol/MapBrowserEvent.js";
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
			const geometry = event.feature.getGeometry();
			if (geometry && geometry.getType() === "Point") {
				const coordinate = (geometry as any).getCoordinates();
				const pixel = map.getPixelFromCoordinate(coordinate);

				const clickEvent = new MapBrowserEvent("click", map, {
					type: "click",
					target: map.getViewport(),
					clientX: pixel[0],
					clientY: pixel[1],
				} as any);

				clickEvent.pixel = pixel;
				clickEvent.coordinate = coordinate;

				requestAnimationFrame(() => {
					map.dispatchEvent(clickEvent);
				});
			}
		});

		map.addInteraction(drawRef.current);
		setIsDrawing(true);
	};

	return (
		<Button variant="outline" onClick={toggleDraw}>
			<NoteIcon />
			{isDrawing ? "Stop Drawing" : "Notiz"}
		</Button>
	);
};

export default DrawNoteButton;
