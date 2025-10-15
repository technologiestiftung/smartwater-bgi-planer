"use client";

import { Button } from "@/components/ui/button";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { EventsKey } from "ol/events";
import { LineString, Polygon } from "ol/geom.js";
import Draw from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import { unByKey } from "ol/Observable.js";
import Overlay from "ol/Overlay.js";
import { Vector as VectorSource } from "ol/source.js";
import { getArea, getLength } from "ol/sphere.js";
import { FC, useEffect, useRef } from "react";

interface DrawProps {
	layerId: string;
	geometryType?: "Point" | "LineString" | "Polygon" | "Circle";
}

const DrawMeasureButton: FC<DrawProps> = ({
	layerId,
	geometryType = "Polygon",
}) => {
	const map = useMapStore((state) => state.map);
	const drawRef = useRef<Draw | null>(null);
	const overlayRef = useRef<Overlay | null>(null);
	const listenerRef = useRef<EventsKey | null>(null);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);

	useEffect(() => {
		if (!map || !layerId) return;

		setLayerVisibility(layerId, true);
	}, [layerId, map, setLayerVisibility]);

	const formatArea = (polygon: Polygon) => {
		const area = getArea(polygon);
		return area > 10000
			? Math.round((area / 1000000) * 100) / 100 + " km²"
			: Math.round(area * 100) / 100 + " m²";
	};

	const formatLength = (line: LineString) => {
		const length = getLength(line);
		return length > 100
			? Math.round((length / 1000) * 100) / 100 + " km"
			: Math.round(length * 100) / 100 + " m";
	};

	const toggleDraw = () => {
		if (!map) return;

		if (drawRef.current) {
			map.removeInteraction(drawRef.current);
			if (overlayRef.current) {
				map.removeOverlay(overlayRef.current);
				overlayRef.current = null;
			}
			if (listenerRef.current) {
				unByKey(listenerRef.current);
			}
			drawRef.current = null;
			return;
		}

		const layer = map
			.getAllLayers()
			.find((l) => l.get("id") === layerId) as VectorLayer<VectorSource>;
		if (!layer) return;

		// Create overlay for measurements
		const measureDiv = document.createElement("div");
		measureDiv.className = "measure-tooltip";
		measureDiv.style.cssText =
			"background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #ccc; font-size: 12px; white-space: nowrap;";

		overlayRef.current = new Overlay({
			element: measureDiv,
			offset: [45, -35],
			positioning: "bottom-center",
		});
		map.addOverlay(overlayRef.current);

		drawRef.current = new Draw({
			source: layer.getSource()!,
			type: geometryType,
		});

		drawRef.current.on("drawstart", (evt) => {
			const sketch = evt.feature;

			listenerRef.current = sketch.getGeometry()!.on("change", (e) => {
				const geom = e.target;
				let output = "";

				if (geom instanceof Polygon) {
					output = formatArea(geom);
					overlayRef.current!.setPosition(
						geom.getInteriorPoint().getCoordinates(),
					);
				} else if (geom instanceof LineString) {
					output = formatLength(geom);
					overlayRef.current!.setPosition(geom.getLastCoordinate());
				}

				measureDiv.innerHTML = output;
			});
		});

		drawRef.current.on("drawend", (event) => {
			measureDiv.innerHTML = "";
			overlayRef.current!.setPosition(undefined);
			if (listenerRef.current) {
				unByKey(listenerRef.current);
			}

			const feature = event.feature;
			const geom = feature.getGeometry();

			// const geojson = new GeoJSON().writeFeatureObject(event.feature);

			if (geom instanceof Polygon) {
				const area = getArea(geom);
				feature.set("area", area);
				feature.set("areaFormatted", formatArea(geom));
			} else if (geom instanceof LineString) {
				const length = getLength(geom);
				feature.set("length", length);
				feature.set("lengthFormatted", formatLength(geom));
			}
		});

		map.addInteraction(drawRef.current);
	};

	return (
		<Button onClick={toggleDraw}>
			{drawRef.current ? "Stop Drawing" : "Draw Measure"}
		</Button>
	);
};

export default DrawMeasureButton;
