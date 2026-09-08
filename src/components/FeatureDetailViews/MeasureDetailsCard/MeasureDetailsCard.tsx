"use client";

import { highlightedConnectedAreaStyle } from "@/components/Modules/MeasurePlanningModule/ConnectedAreaSelection";
import { getModuleStepMeasure } from "@/components/Modules/shared/moduleConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import layerConfig from "@/config/layerConfig.json";
import { measureConfigById } from "@/config/measuresConfig";
import { formatMeasureValue } from "@/lib/helpers/measures/values";
import { getLayerById } from "@/lib/helpers/ol";
import { useMapStore } from "@/store/map";
import { useScenarioStore } from "@/store/scenario";
import type { MeasureValue } from "@/store/scenario/types";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import { TrashIcon, XCircleIcon } from "@phosphor-icons/react";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import type { StyleLike } from "ol/style/Style";
import { FC, useEffect, useRef } from "react";

const PARAM_LABELS: Partial<Record<string, string>> = {
	area: "Fläche",
	connectedArea: "Angeschlossene Fläche",
};

const getDisplayName = (configId: string): string => {
	const layer = (layerConfig as Array<{ id?: string; name?: string }>).find(
		(item) => item.id === configId,
	);
	const name = layer?.name || configId;
	const nameStartsWithANumber = /^\d/.test(name);
	if (nameStartsWithANumber) {
		const measure = getModuleStepMeasure("measurePlanning", configId);
		if (measure && measure.title) {
			return measure.title;
		}
	}
	return name;
};

interface MeasureDetailsCardProps {
	measureId: string;
	onClose?: () => void;
}

export const MeasureDetailsCard: FC<MeasureDetailsCardProps> = ({
	measureId,
	onClose,
}) => {
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const measure = useScenarioStore((state) => {
		if (!state.activeScenarioId) return null;
		return (
			state.scenarios[state.activeScenarioId]?.measures.find(
				(item) => item.id === measureId,
			) ?? null
		);
	});
	const addPendingDeleteMeasureId = useUiStore(
		(state) => state.addPendingDeleteMeasureId,
	);
	const map = useMapStore((state) => state.map);

	const connectedAreas = useScenarioStore((state) =>
		state.activeScenarioId
			? (state.scenarios[state.activeScenarioId]?.connectedAreas ?? [])
			: [],
	);

	const relatedConnectedAreaId = measure
		? connectedAreas.find((ca) => ca.usedByMeasureId === measure.id)?.id
		: undefined;

	const previousStyleRef = useRef<StyleLike | undefined>(undefined);

	useEffect(() => {
		if (!map || !relatedConnectedAreaId) return;

		const layer = getLayerById(
			map,
			LAYER_IDS.CONNECTED_AREA_DRAW,
		) as VectorLayer<VectorSource> | null;
		const feature = layer
			?.getSource()
			?.getFeatures()
			.find((f) => f.get("connectedAreaId") === relatedConnectedAreaId);
		if (!feature) return;

		previousStyleRef.current = feature.getStyle();
		feature.setStyle(highlightedConnectedAreaStyle);
		return () => {
			feature.setStyle(previousStyleRef.current);
		};
	}, [map, relatedConnectedAreaId]);

	if (!measure || !activeScenarioId) {
		return null;
	}

	const measureConfig = measureConfigById.get(measure.configId);
	if (!measureConfig) {
		return null;
	}

	const measureValues: Record<string, MeasureValue> = {
		area: measure.area,
		connectedArea: measure.connectedArea ?? null,
	};

	const handleDelete = () => {
		if (map && measure.drawLayerId) {
			const layer = map
				.getAllLayers()
				.find((item) => item.get("id") === measure.drawLayerId) as
				VectorLayer<VectorSource> | undefined;
			const source = layer?.getSource();
			if (source) {
				const feature = source
					.getFeatures()
					.find((f) => f.get("measureId") === measure.id);
				if (feature) source.removeFeature(feature);
			}
		}
		addPendingDeleteMeasureId(measure.id);
		onClose?.();
	};

	return (
		<div className="MeasureDetailsCard-root bg-background w-90 max-w-sm shadow-lg sm:max-w-90">
			<div className="border-muted flex h-8 w-full items-center justify-between border-b pl-2">
				<h3 className="text-sm font-semibold">
					{getDisplayName(measure.configId)}
				</h3>
				<div className="bg-secondary h-8 w-8 text-white">
					<button
						type="button"
						onClick={onClose}
						aria-label="Schließen"
						className="flex h-full w-full items-center justify-center"
					>
						<XCircleIcon />
					</button>
				</div>
			</div>
			<div className="flex flex-col gap-3 p-3">
				{measureConfig.parameters.map((param) => (
					<label key={param.key} className="flex flex-col gap-1">
						<div className="flex items-center justify-between gap-2">
							<span className="text-sm font-medium">
								{PARAM_LABELS[param.key] ?? param.key}
							</span>
							{param.unit && (
								<span className="text-xs text-gray-500">{param.unit}</span>
							)}
						</div>
						<Input
							type={param.type === "string" ? "text" : "number"}
							value={formatMeasureValue(measureValues[param.key])}
							readOnly
							disabled
						/>
					</label>
				))}

				<div className="flex gap-2">
					<Button variant="outline" onClick={handleDelete} className="flex-1">
						<TrashIcon size={16} />
						Löschen
					</Button>
				</div>
			</div>
		</div>
	);
};
