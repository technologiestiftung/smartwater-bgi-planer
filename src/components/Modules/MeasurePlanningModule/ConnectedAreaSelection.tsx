"use client";

import { useConnectedAreaSelection } from "@/hooks/useConnectedAreaSelection";
import { isSwaleLayerConfigId } from "@/lib/helpers/measures/swale";
import { getLayerById } from "@/lib/helpers/ol";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import { never, singleClick } from "ol/events/condition";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import Select from "ol/interaction/Select";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

interface ConnectedAreaSelectionProps {
	layerConfigId: string;
	drawLayerId: string;
	layerName: string;
}

const selectedConnectedAreaStyle = new Style({
	fill: new Fill({ color: "rgba(0, 153, 255, 0.1)" }),
	stroke: new Stroke({ color: "rgba(0, 153, 255, 1)", width: 2 }),
});

const usedConnectedAreaStyle = new Style({
	fill: new Fill({ color: "rgba(150, 150, 150, 0.15)" }),
	stroke: new Stroke({
		color: "rgba(150, 150, 150, 0.6)",
		width: 1.5,
		lineDash: [6, 4],
	}),
});

const areaFormatter = new Intl.NumberFormat("de-DE", {
	maximumFractionDigits: 2,
});

export function ConnectedAreaSelection({
	layerConfigId,
	drawLayerId,
	layerName,
}: ConnectedAreaSelectionProps) {
	const map = useMapStore((state) => state.map);
	const {
		isConnectedAreaSelecting,
		setIsConnectedAreaSelecting,
		selectedConnectedAreaId,
		setSelectedConnectedArea,
		isDrawing,
	} = useUiStore(
		useShallow((state) => ({
			isConnectedAreaSelecting: state.isConnectedAreaSelecting,
			setIsConnectedAreaSelecting: state.setIsConnectedAreaSelecting,
			selectedConnectedAreaId: state.selectedConnectedAreaId,
			setSelectedConnectedArea: state.setSelectedConnectedArea,
			isDrawing: state.isDrawing,
		})),
	);

	const selectInteractionRef = useRef<Select | null>(null);
	const isSwaleMeasure = isSwaleLayerConfigId(layerConfigId);
	const { selectedConnectedArea, connectedAreas, summary } =
		useConnectedAreaSelection(layerConfigId, drawLayerId);

	useEffect(() => {
		if (!isDrawing && connectedAreas.length > 0) {
			setIsConnectedAreaSelecting(true);
		} else if (connectedAreas.length === 0) {
			setIsConnectedAreaSelecting(false);
		}
	}, [connectedAreas.length, isDrawing, setIsConnectedAreaSelecting]);

	useEffect(() => {
		if (!isSwaleMeasure || (selectedConnectedAreaId && selectedConnectedArea))
			return;
		if (connectedAreas.length === 1)
			setSelectedConnectedArea(connectedAreas[0].id);
	}, [
		connectedAreas,
		isSwaleMeasure,
		selectedConnectedArea,
		selectedConnectedAreaId,
		setSelectedConnectedArea,
	]);

	const availableIds = useMemo(
		() => new Set(connectedAreas.map((ca) => ca.id)),
		[connectedAreas],
	);

	useEffect(() => {
		if (!map) return;
		const layer = getLayerById(
			map,
			LAYER_IDS.CONNECTED_AREA_DRAW,
		) as VectorLayer<VectorSource> | null;
		layer
			?.getSource()
			?.getFeatures()
			.forEach((feature) => {
				const id = feature.get("connectedAreaId") as string | undefined;
				if (id && id === selectedConnectedAreaId) {
					feature.setStyle(selectedConnectedAreaStyle);
				} else if (id && !availableIds.has(id)) {
					feature.setStyle(usedConnectedAreaStyle);
				} else {
					feature.setStyle(undefined);
				}
			});
	}, [map, selectedConnectedAreaId, availableIds]);

	useEffect(() => {
		if (!map || !isConnectedAreaSelecting) return;
		const layer = getLayerById(
			map,
			LAYER_IDS.CONNECTED_AREA_DRAW,
		) as VectorLayer<VectorSource> | null;
		if (!layer) return;

		const select = new Select({
			layers: [layer],
			condition: singleClick,
			addCondition: singleClick,
			removeCondition: singleClick,
			toggleCondition: never,
			multi: false,
			filter: (feature) => {
				const id = feature.get("connectedAreaId") as string | undefined;
				return !!id && availableIds.has(id);
			},
		});

		const handleSelect = (event: { selected: Feature<Geometry>[] }) => {
			const id = event.selected[0]?.get("connectedAreaId") as
				| string
				| undefined;
			if (id) setSelectedConnectedArea(id);
		};

		select.on("select", handleSelect as any);
		map.addInteraction(select);

		if (selectedConnectedAreaId) {
			const preselected = layer
				.getSource()
				?.getFeatures()
				.find(
					(f) =>
						(f.get("connectedAreaId") as string | undefined) ===
						selectedConnectedAreaId,
				);
			if (preselected) {
				select.getFeatures().clear();
				select.getFeatures().push(preselected);
			}
		}

		selectInteractionRef.current = select;
		return () => {
			select.un("select", handleSelect as any);
			map.removeInteraction(select);
			selectInteractionRef.current = null;
		};
	}, [
		map,
		isConnectedAreaSelecting,
		selectedConnectedAreaId,
		setSelectedConnectedArea,
		availableIds,
	]);

	useEffect(() => {
		return () => {
			setIsConnectedAreaSelecting(false);
		};
	}, [setIsConnectedAreaSelecting]);

	if (!isSwaleMeasure) return null;

	return (
		<div className="border-muted mb-4 rounded-sm border p-3">
			<p className="text-sm font-semibold">Angeschlossene Fläche auswählen</p>
			<p className="text-muted-foreground mt-1 mb-2 text-xs">
				Wähle eine angeschlossene Fläche direkt durch Klick auf die Karte. Die
				ausgewählte Fläche wird markiert und ihr Wert in der Maßnahme
				gespeichert.
			</p>
			{connectedAreas.length === 0 ? (
				<p className="text-muted-foreground text-xs">
					Keine angeschlossene Fläche vorhanden.
				</p>
			) : (
				<div className="border-muted rounded-sm border p-2 text-sm">
					<p className="mb-1 font-semibold">{layerName}</p>
					<div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
						<span>Angeschlossene Fläche</span>
						<span>{areaFormatter.format(summary.connectedArea)} m²</span>
						<span>Potentialfläche</span>
						<span>{areaFormatter.format(summary.potentialArea)} m²</span>
						<span>Maßnahmenfläche</span>
						<span>{areaFormatter.format(summary.measureArea)} m²</span>
					</div>
				</div>
			)}
		</div>
	);
}
