"use client";

import { Button } from "@/components/ui/button";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import GeoJSON from "ol/format/GeoJSON.js";
import Draw from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import { FC, useEffect, useRef } from "react";

interface DrawButtonProps {
	layerId: string;
	geometryType?: "Point" | "LineString" | "Polygon" | "Circle";
}

const DrawButton: FC<DrawButtonProps> = ({
	layerId,
	geometryType = "Polygon",
}) => {
	const map = useMapStore((state) => state.map);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);

	const drawRef = useRef<Draw | null>(null);

	useEffect(() => {
		if (!map || !layerId) return;

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
			type: geometryType,
		});

		drawRef.current.on("drawend", (event) => {
			const feature = event.feature;
			console.log("Feature drawn:", feature);
			const geojson = new GeoJSON().writeFeatureObject(event.feature);
			console.log("GeoJSON:", geojson);
		});

		map.addInteraction(drawRef.current);
	};

	return (
		<Button onClick={toggleDraw}>
			{drawRef.current ? "Stop Zeichnen" : "Zeichnen"}
		</Button>
	);
};

export default DrawButton;
