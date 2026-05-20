"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import layerConfig from "@/config/layerConfig.json";
import measuresConfig from "@/config/measuresConfig.json";
import { createMeasureConfigMap } from "@/lib/helpers/measures/config";
import {
	formatMeasureValue,
	parseMeasureValue,
} from "@/lib/helpers/measures/values";
import { useMapStore } from "@/store/map";
import { useScenarioStore } from "@/store/scenario";
import type { MeasureValue } from "@/store/scenario/types";
import type { MeasureConfig } from "@/types/measures";
import { CheckIcon, TrashIcon, XCircleIcon } from "@phosphor-icons/react";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import { FC, useState } from "react";

const measureConfigById = createMeasureConfigMap(
	measuresConfig as MeasureConfig[],
);

const getDisplayName = (configId: string): string => {
	const layer = (layerConfig as Array<{ id?: string; name?: string }>).find(
		(item) => item.id === configId,
	);
	return layer?.name || configId;
};

interface MeasureDetailsCardProps {
	measureId: string;
	onClose?: () => void;
}

export const MeasureDetailsCard: FC<MeasureDetailsCardProps> = ({
	measureId,
	onClose,
}) => {
	const [draftValues, setDraftValues] = useState<Record<string, string>>({});

	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const measure = useScenarioStore((state) => {
		if (!state.activeScenarioId) return null;
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
	const map = useMapStore((state) => state.map);

	if (!measure || !activeScenarioId) {
		return null;
	}

	const measureConfig = measureConfigById.get(measure.configId);
	if (!measureConfig) {
		return null;
	}

	const measureValues: Record<string, MeasureValue> = { area: measure.area };

	const handleSave = () => {
		const nextValues = measureConfig.parameters.reduce<
			Record<string, MeasureValue>
		>((acc, param) => {
			acc[param.key] = parseMeasureValue(draftValues[param.key] ?? "", param);
			return acc;
		}, {});

		updateMeasureValues(activeScenarioId, measure.id, nextValues);
		onClose?.();
	};

	const handleDelete = () => {
		if (map && measure.drawLayerId) {
			const layer = map
				.getAllLayers()
				.find((item) => item.get("id") === measure.drawLayerId) as
				| VectorLayer<VectorSource>
				| undefined;
			const source = layer?.getSource();
			if (source) {
				const feature = source
					.getFeatures()
					.find((f) => f.get("measureId") === measure.id);
				if (feature) {
					source.removeFeature(feature);
				}
			}
		}

		removeMeasure(activeScenarioId, measure.id);
		onClose?.();
	};

	const hasInputParams = measureConfig.parameters.some(
		(p) => p.source === "input",
	);

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
							<span className="text-sm font-medium">{param.key}</span>
							{param.unit && (
								<span className="text-xs text-gray-500">{param.unit}</span>
							)}
						</div>
						<Input
							type={param.type === "string" ? "text" : "number"}
							value={
								draftValues[param.key] ??
								formatMeasureValue(measureValues[param.key])
							}
							readOnly={param.source === "drawn"}
							disabled={param.source === "drawn"}
							onChange={(e) =>
								setDraftValues((prev) => ({
									...prev,
									[param.key]: e.target.value,
								}))
							}
						/>
					</label>
				))}

				<div className="flex gap-2">
					{hasInputParams && (
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
