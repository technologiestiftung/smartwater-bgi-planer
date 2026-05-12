"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import measuresConfig from "@/config/measuresConfig.json";
import {
	createMeasureConfigMap,
	normalizeMeasureGeometryType,
} from "@/lib/helpers/measures/config";
import {
	formatMeasureValue,
	getDrawnValue,
	parseMeasureValue,
} from "@/lib/helpers/measures/values";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useScenarioStore } from "@/store/scenario";
import type { ScenarioMeasureValue } from "@/store/scenario/types";
import type { MeasureConfig } from "@/types/measures";
import { CheckIcon, TrashIcon, XCircleIcon } from "@phosphor-icons/react";
import type Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON.js";
import type { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import { FC, useEffect, useMemo, useState } from "react";

const measureConfigById = createMeasureConfigMap(
	measuresConfig as MeasureConfig[],
);

interface MeasureDetailsCardProps {
	measureId: string;
	feature?: Feature<Geometry>;
	layerId?: string;
	onClose?: () => void;
}

const toLabel = (value: string) =>
	value
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/_/g, " ")
		.replace(/^./, (char) => char.toUpperCase());

export const MeasureDetailsCard: FC<MeasureDetailsCardProps> = ({
	measureId,
	feature,
	layerId,
	onClose,
}) => {
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const measure = useScenarioStore((state) => {
		if (!state.activeScenarioId) {
			return null;
		}

		return (
			state.scenarios[state.activeScenarioId]?.measures.find(
				(item) => item.id === measureId,
			) ?? null
		);
	});
	const updateMeasureValues = useScenarioStore(
		(state) => state.updateMeasureValues,
	);
	const removeMeasure = useScenarioStore((state) => state.removeMeasure);
	const addMeasure = useScenarioStore((state) => state.addMeasure);
	const layerConfigs = useLayersStore((state) => state.layerConfig);
	const map = useMapStore((state) => state.map);

	useEffect(() => {
		if (!feature || measure) {
			return;
		}

		const scenarioId = useScenarioStore.getState().activeScenarioId;

		if (!scenarioId) {
			return;
		}

		const existingMeasure = useScenarioStore
			.getState()
			.scenarios[scenarioId]?.measures.some((item) => item.id === measureId);
		if (existingMeasure) {
			return;
		}

		const featureLayerConfigId =
			feature.get("measureLayerConfigId") ||
			layerConfigs.find((config) => config.drawLayerId === layerId)?.id ||
			"";
		const measureConfig = measureConfigById.get(featureLayerConfigId);
		if (!measureConfig) {
			return;
		}

		const currentLayerConfig = layerConfigs.find(
			(config) => config.id === featureLayerConfigId,
		);
		const values = measureConfig.parameters.reduce<
			Record<string, ScenarioMeasureValue>
		>((accumulator, parameter) => {
			const storedValue = feature.get(parameter.key);
			if (storedValue !== undefined) {
				accumulator[parameter.key] = storedValue as ScenarioMeasureValue;
				return accumulator;
			}

			accumulator[parameter.key] =
				parameter.source === "drawn"
					? getDrawnValue(parameter, feature)
					: (parameter.default ?? "");
			return accumulator;
		}, {});

		const geojson = new GeoJSON();
		const featureObject = geojson.writeFeatureObject(feature, {
			featureProjection: map?.getView().getProjection() || "EPSG:25833",
			dataProjection: "EPSG:4326",
		});

		const payload = {
			id: measureId,
			createdAt: Date.now(),
			geometryType: normalizeMeasureGeometryType(
				feature.getGeometry()?.getType(),
			),
			drawLayerId: layerId ?? null,
			layerConfigId: featureLayerConfigId,
			measureKey: measureConfig.key,
			title:
				currentLayerConfig?.name || currentLayerConfig?.question || "Maßnahme",
			feature: featureObject,
			values,
		};

		feature.set("measureId", payload.id);
		feature.set("measureLayerConfigId", payload.layerConfigId);
		feature.set("measureKey", payload.measureKey);
		feature.set("measureTitle", payload.title);
		Object.entries(values).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== "") {
				feature.set(key, value);
			}
		});

		addMeasure(scenarioId, payload);
	}, [addMeasure, feature, layerConfigs, layerId, map, measure, measureId]);

	const measureConfig = useMemo(() => {
		if (!measure) {
			return null;
		}

		return measureConfigById.get(measure.layerConfigId) ?? null;
	}, [measure]);

	const [draftValues, setDraftValues] = useState<Record<string, string>>({});

	if (!measure || !measureConfig || !activeScenarioId) {
		return null;
	}

	const hasEditableParameters = measureConfig.parameters.some(
		(parameter) => parameter.source === "input",
	);
	const displayValues = measureConfig.parameters.reduce<Record<string, string>>(
		(accumulator, parameter) => {
			accumulator[parameter.key] =
				draftValues[parameter.key] ??
				formatMeasureValue(measure.values[parameter.key]);
			return accumulator;
		},
		{},
	);

	const handleSave = () => {
		const nextValues = measureConfig.parameters.reduce<
			Record<string, ScenarioMeasureValue>
		>((accumulator, parameter) => {
			accumulator[parameter.key] = parseMeasureValue(
				draftValues[parameter.key] ?? "",
				parameter,
			);
			return accumulator;
		}, {});

		updateMeasureValues(activeScenarioId, measure.id, nextValues);
		onClose?.();
	};

	const handleDelete = () => {
		if (!activeScenarioId) {
			return;
		}

		if (map && measure.drawLayerId) {
			const layer = map
				.getAllLayers()
				.find((item) => item.get("id") === measure.drawLayerId) as
				| VectorLayer<VectorSource>
				| undefined;
			const source = layer?.getSource();
			if (source) {
				const featureToRemove = source
					.getFeatures()
					.find((feature) => feature.get("measureId") === measure.id);
				if (featureToRemove) {
					source.removeFeature(featureToRemove);
					source.changed();
				}
			}
		}

		removeMeasure(activeScenarioId, measure.id);
		onClose?.();
	};

	return (
		<div className="MeasureDetailsCard-root bg-background w-90 max-w-sm shadow-lg sm:max-w-90">
			<div className="border-muted flex h-8 w-full items-center justify-between border-b pl-2">
				<h3 className="text-sm font-semibold">{measure.title}</h3>
				<div className="bg-secondary h-8 w-8 text-white">
					<button
						type="button"
						className="flex h-full w-full items-center justify-center"
						onClick={onClose}
					>
						<XCircleIcon />
					</button>
				</div>
			</div>
			<div className="flex flex-col gap-3 p-3">
				{measureConfig.parameters.map((parameter) => {
					const isReadOnly = parameter.source === "drawn";
					const value = displayValues[parameter.key] ?? "";

					return (
						<label key={parameter.key} className="flex flex-col gap-1">
							<div className="flex items-center justify-between gap-2">
								<span className="text-sm font-medium">
									{toLabel(parameter.key)}
								</span>
								<div className="text-muted-foreground flex items-center gap-2 text-xs">
									<span>
										{parameter.source === "drawn" ? "Gezeichnet" : "Eingabe"}
									</span>
									{parameter.unit && <span>{parameter.unit}</span>}
								</div>
							</div>
							<Input
								type={parameter.type === "string" ? "text" : "number"}
								step={parameter.type === "integer" ? 1 : "any"}
								value={value}
								readOnly={isReadOnly}
								disabled={isReadOnly}
								required={parameter.required}
								onChange={(event) =>
									setDraftValues((currentValues) => ({
										...currentValues,
										[parameter.key]: event.target.value,
									}))
								}
							/>
						</label>
					);
				})}

				<div className="flex gap-2">
					{hasEditableParameters && (
						<Button onClick={handleSave} className="flex-1">
							<CheckIcon />
							Speichern
						</Button>
					)}
					<Button variant="outline" onClick={handleDelete} className="flex-1">
						<TrashIcon size={16} />
						Löschen
					</Button>
				</div>
			</div>
		</div>
	);
};
