"use client";

import { Button } from "@/components/ui/button";
import { removeMeasureFeatureFromLayer } from "@/lib/helpers/ol";
import {
	getInputFeatures,
	performProjectBoundaryIntersection,
} from "@/lib/helpers/projectBoundary";
import { useMapStore } from "@/store/map";
import { useProjectStore } from "@/store/project";
import { useScenarioStore } from "@/store/scenario";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import { TrashIcon, XCircleIcon } from "@phosphor-icons/react";
import type Feature from "ol/Feature";
import type { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from "ol/source";
import { FC, useState } from "react";

interface FeatureActionMenuProps {
	layerId?: string;
	features?: Feature<Geometry>;
	onClose?: () => void;
}

export const FeatureActionMenu: FC<FeatureActionMenuProps> = ({
	layerId,
	features,
	onClose,
}) => {
	const map = useMapStore((state) => state.map);
	const setInputFeatures = useProjectStore((state) => state.setInputFeatures);
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const removeMeasure = useScenarioStore((state) => state.removeMeasure);
	const removeConnectedArea = useScenarioStore(
		(state) => state.removeConnectedArea,
	);
	const selectedConnectedAreaId = useUiStore(
		(state) => state.selectedConnectedAreaId,
	);
	const setSelectedConnectedArea = useUiStore(
		(state) => state.setSelectedConnectedArea,
	);

	const [isDeleting, setIsDeleting] = useState(false);

	/* eslint-disable complexity, max-depth */
	const handleDelete = async () => {
		if (!features || !map || !layerId || isDeleting) return;

		setIsDeleting(true);
		try {
			const layer = map
				.getAllLayers()
				.find((l) => l.get("id") === layerId) as VectorLayer<VectorSource>;

			if (layer && layer.getSource()) {
				const source = layer.getSource()!;
				source.removeFeature(features);
				source.changed();

				if (activeScenarioId) {
					const measureId = features.get("measureId") as string | undefined;
					const connectedAreaId = features.get("connectedAreaId") as
						string | undefined;

					if (measureId) {
						removeMeasure(activeScenarioId, measureId);
					}
					if (connectedAreaId) {
						const scenario =
							useScenarioStore.getState().scenarios[activeScenarioId];
						const connectedArea = scenario?.connectedAreas.find(
							(ca) => ca.id === connectedAreaId,
						);
						const usedByMeasureId = connectedArea?.usedByMeasureId;

						if (usedByMeasureId === "trees") {
							const treeMeasures = (scenario?.measures ?? []).filter(
								(m) =>
									m.name.startsWith("trees_") &&
									(m.connectedAreaId !== null && m.connectedAreaId !== undefined
										? m.connectedAreaId === connectedAreaId
										: m.code === connectedArea?.code),
							);
							for (const m of treeMeasures) {
								removeMeasureFeatureFromLayer(map, m.drawLayerId, m.id);
								removeMeasure(activeScenarioId, m.id);
							}
						} else if (usedByMeasureId) {
							const connectedMeasure = scenario?.measures.find(
								(m) => m.id === usedByMeasureId,
							);
							removeMeasureFeatureFromLayer(
								map,
								connectedMeasure?.drawLayerId ?? null,
								usedByMeasureId,
							);
							removeMeasure(activeScenarioId, usedByMeasureId);
						}

						removeConnectedArea(activeScenarioId, connectedAreaId);
						if (selectedConnectedAreaId === connectedAreaId) {
							setSelectedConnectedArea(null);
						}
					}
				}

				if (layerId === LAYER_IDS.PROJECT_BOUNDARY) {
					setTimeout(() => {
						performProjectBoundaryIntersection(map);
						setInputFeatures(getInputFeatures(map));
					}, 10);
				}
			}
		} catch (error) {
			console.error("Error deleting feature:", error);
		} finally {
			setIsDeleting(false);
			onClose?.();
		}
	};
	/* eslint-enable complexity, max-depth */

	if (!features) return null;

	return (
		<div className="FeatureActionMenu-root bg-background w-62.5 shadow-lg">
			<div className="border-muted flex h-8 w-full items-center justify-between border-b pl-2">
				<h3 className="text-sm font-semibold">Feature bearbeiten</h3>
				<div className="bg-secondary h-8 w-8 text-white">
					<button
						className="flex h-full w-full items-center justify-center"
						onClick={onClose}
					>
						<XCircleIcon />
					</button>
				</div>
			</div>
			<div className="flex flex-col gap-2 p-2">
				<Button
					variant="outline"
					onClick={handleDelete}
					className="w-full"
					disabled={isDeleting}
				>
					<TrashIcon size={16} />
					{isDeleting ? "Wird gelöscht..." : "Feature löschen"}
				</Button>
			</div>
		</div>
	);
};
