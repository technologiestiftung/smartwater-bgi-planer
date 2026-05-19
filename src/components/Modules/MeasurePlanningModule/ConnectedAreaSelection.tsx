"use client";

import { Button } from "@/components/ui/button";
import { isSwaleLayerConfigId } from "@/lib/helpers/measures/swale";
import { getLayerById } from "@/lib/helpers/ol";
import { useMapStore } from "@/store/map";
import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import { never, singleClick } from "ol/events/condition.js";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import Select from "ol/interaction/Select.js";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import { useEffect, useMemo, useRef } from "react";

interface ConnectedAreaSelectionProps {
	layerConfigId: string;
	drawLayerId: string;
	layerName: string;
}

const EMPTY_CONNECTED_AREAS: Array<{ id: string; area: number }> = [];
const EMPTY_MEASURES: Array<{
	area: number;
	configId: string;
	drawLayerId: string | null;
}> = [];

export function ConnectedAreaSelection({
	layerConfigId,
	drawLayerId,
	layerName,
}: ConnectedAreaSelectionProps) {
	const map = useMapStore((state) => state.map);
	const isConnectedAreaSelecting = useUiStore(
		(state) => state.isConnectedAreaSelecting,
	);
	const setIsConnectedAreaSelecting = useUiStore(
		(state) => state.setIsConnectedAreaSelecting,
	);
	const selectedConnectedAreaId = useUiStore(
		(state) => state.selectedConnectedAreaId,
	);
	const setSelectedConnectedArea = useUiStore(
		(state) => state.setSelectedConnectedArea,
	);
	const resetDrawInteractions = useUiStore(
		(state) => state.resetDrawInteractions,
	);
	const setIsBlockAreaSelecting = useUiStore(
		(state) => state.setIsBlockAreaSelecting,
	);
	const connectedAreas = useScenarioStore((state) => {
		if (!state.activeScenarioId) return EMPTY_CONNECTED_AREAS;
		return (
			state.scenarios[state.activeScenarioId]?.connectedAreas ??
			EMPTY_CONNECTED_AREAS
		);
	});
	const measures = useScenarioStore((state) => {
		if (!state.activeScenarioId) return EMPTY_MEASURES;
		return state.scenarios[state.activeScenarioId]?.measures ?? EMPTY_MEASURES;
	});

	const selectInteractionRef = useRef<Select | null>(null);
	const isSwaleMeasure = isSwaleLayerConfigId(layerConfigId);

	const measureRows = useMemo(
		() =>
			measures.filter((measure) => {
				// Keep summary strictly scoped to the currently open measurement step.
				if (measure.configId === layerConfigId) return true;
				if (measure.configId === drawLayerId) return true;
				if (measure.drawLayerId === drawLayerId) return true;
				return false;
			}),
		[measures, layerConfigId, drawLayerId],
	);

	const selectedConnectedArea = useMemo(
		() =>
			connectedAreas.find((area) => area.id === selectedConnectedAreaId) ??
			null,
		[connectedAreas, selectedConnectedAreaId],
	);

	const summary = useMemo(() => {
		const count = measureRows.length;

		const measureArea = measureRows.reduce((sum, measure) => {
			const area = measure.area;
			return typeof area === "number" ? sum + area : sum;
		}, 0);

		return {
			count,
			measureArea,
			connectedArea: selectedConnectedArea?.area ?? 0,
		};
	}, [measureRows, selectedConnectedArea]);

	useEffect(() => {
		if (!isSwaleMeasure) return;
		if (selectedConnectedAreaId && selectedConnectedArea) return;
		if (connectedAreas.length === 1) {
			setSelectedConnectedArea(connectedAreas[0].id);
		}
	}, [
		connectedAreas,
		isSwaleMeasure,
		selectedConnectedArea,
		selectedConnectedAreaId,
		setSelectedConnectedArea,
	]);

	useEffect(() => {
		if (!map) return;
		if (!isConnectedAreaSelecting) return;

		const connectedAreaLayer = getLayerById(
			map,
			LAYER_IDS.CONNECTED_AREA_DRAW,
		) as VectorLayer<VectorSource> | null;
		if (!connectedAreaLayer) return;

		const select = new Select({
			layers: [connectedAreaLayer],
			condition: singleClick,
			addCondition: singleClick,
			removeCondition: singleClick,
			// Disable the default toggle behavior
			toggleCondition: never,
			multi: false,
		});

		const handleSelect = (event: { selected: Feature<Geometry>[] }) => {
			const feature = event.selected[0];
			if (!feature) return;

			const connectedAreaId = feature.get("connectedAreaId") as
				| string
				| undefined;
			if (!connectedAreaId) return;

			setSelectedConnectedArea(connectedAreaId);
		};

		select.on("select", handleSelect as any);
		map.addInteraction(select);

		if (selectedConnectedAreaId) {
			const preselectedFeature = connectedAreaLayer
				.getSource()
				?.getFeatures()
				.find(
					(feature) =>
						(feature.get("connectedAreaId") as string | undefined) ===
						selectedConnectedAreaId,
				);
			if (preselectedFeature) {
				select.getFeatures().clear();
				select.getFeatures().push(preselectedFeature);
			}
		}

		selectInteractionRef.current = select;

		return () => {
			if (selectInteractionRef.current) {
				selectInteractionRef.current.un("select", handleSelect as any);
				map.removeInteraction(selectInteractionRef.current);
				selectInteractionRef.current = null;
			}
		};
	}, [
		map,
		isConnectedAreaSelecting,
		selectedConnectedAreaId,
		setSelectedConnectedArea,
	]);

	useEffect(() => {
		return () => {
			setIsConnectedAreaSelecting(false);
			setIsBlockAreaSelecting(false);
		};
	}, [setIsBlockAreaSelecting, setIsConnectedAreaSelecting]);

	if (!isSwaleMeasure) {
		return null;
	}

	const areaFormatter = new Intl.NumberFormat("de-DE", {
		maximumFractionDigits: 2,
	});

	const toggleConnectedAreaSelection = () => {
		if (isConnectedAreaSelecting) {
			setIsConnectedAreaSelecting(false);
			setIsBlockAreaSelecting(false);
			return;
		}

		resetDrawInteractions();
		setIsConnectedAreaSelecting(true);
		setIsBlockAreaSelecting(true);
	};

	return (
		<div className="border-muted mb-4 rounded-sm border p-3">
			<p className="text-sm font-semibold">Angeschlossene Fläche auswählen</p>
			<p className="text-muted-foreground mt-1 mb-2 text-xs">
				Wähle eine angeschlossene Fläche direkt durch Klick auf die Karte. Die
				ausgewählte Fläche wird markiert und ihr Wert in der Maßnahme
				gespeichert.
			</p>

			<div className="mb-3">
				<Button
					type="button"
					variant={isConnectedAreaSelecting ? "default" : "outline"}
					onClick={toggleConnectedAreaSelection}
					disabled={connectedAreas.length === 0}
				>
					{isConnectedAreaSelecting
						? "Auswahl beenden"
						: "Fläche auf Karte auswählen"}
				</Button>
			</div>

			{connectedAreas.length === 0 ? (
				<p className="text-muted-foreground text-xs">
					Keine angeschlossene Fläche vorhanden.
				</p>
			) : (
				<div className="border-muted rounded-sm border p-2 text-sm">
					<p className="mb-1 font-semibold">{layerName}</p>
					<div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
						<span>Anzahl</span>
						<span>{summary.count}</span>
						<span>Angeschlossene Fläche</span>
						<span>{areaFormatter.format(summary.connectedArea)} m²</span>
						<span>Maßnahmenfläche</span>
						<span>{areaFormatter.format(summary.measureArea)} m²</span>
					</div>
				</div>
			)}
		</div>
	);
}
