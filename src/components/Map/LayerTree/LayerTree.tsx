"use client";

import { useLayersStore } from "@/store/layers";
import { ManagedLayer } from "@/store/layers/types";
import { FC, useCallback, useMemo } from "react";

const useLayerData = () => {
	const layersMap = useLayersStore((state) => state.layers);

	const layerData = useMemo(() => {
		const allLayers = Array.from(layersMap.values());

		const subjectLayers = allLayers.filter((l) => l.layerType === "subject");
		const visibleSubjectLayers = subjectLayers.filter((l) => l.visibility);

		return {
			subjectLayers,
			visibleSubjectLayers,
			visibleCount: visibleSubjectLayers.length,
		};
	}, [layersMap]);

	return layerData;
};

const LayerItem: FC<{ layer: ManagedLayer }> = ({ layer }) => {
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);

	const handleVisibilityChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setLayerVisibility(layer.id, e.target.checked);
		},
		[layer.id, setLayerVisibility],
	);

	const serviceName = layer.config?.service?.name ?? "Unnamed Layer";

	return (
		<div className="flex items-center justify-between border-b p-3">
			<label
				htmlFor={layer.id}
				className="flex flex-1 cursor-pointer items-center space-x-3"
			>
				<span
					className={`font-medium ${layer.visibility ? "text-blue-600" : ""}`}
				>
					{serviceName}
				</span>
			</label>
			<input
				id={layer.id}
				type="checkbox"
				checked={layer.visibility}
				onChange={handleVisibilityChange}
				className="h-5 w-5"
				disabled={layer.status === "error"}
			/>
		</div>
	);
};

const LayerTree: FC = () => {
	const { subjectLayers } = useLayerData();

	return (
		<div className="fixed top-4 right-4 z-48 w-80 max-w-sm rounded-lg border bg-white shadow-lg">
			<div className="border-b p-4">
				<h2 className="text-lg font-semibold">Layer Tree</h2>
			</div>
			<div className="max-h-96 overflow-y-auto">
				<LayerTreeContent layers={subjectLayers} />
			</div>
		</div>
	);
};

export const LayerTreeContent: FC<{
	layers?: ManagedLayer[];
}> = ({ layers: providedLayers }) => {
	const layersToRender = providedLayers;

	if (!layersToRender || layersToRender.length === 0) {
		return (
			<div className="flex items-center justify-center py-8 text-gray-500">
				<p>No layers available</p>
			</div>
		);
	}

	return (
		<div>
			{layersToRender.map((layer) => (
				<LayerItem key={layer.id} layer={layer} />
			))}
		</div>
	);
};

export default LayerTree;
