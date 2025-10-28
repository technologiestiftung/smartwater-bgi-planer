"use client";

import { useLayersStore } from "@/store/layers";
import Image from "next/image";
import { FC, useMemo } from "react";

const BaselayerSwitch: FC = () => {
	const layersMap = useLayersStore((state) => state.layers);
	const setLayerVisibility = useLayersStore(
		(state) => state.setLayerVisibility,
	);

	const baseLayers = useMemo(() => {
		const allLayers = Array.from(layersMap.values());
		return allLayers.filter((l) => l.layerType === "base");
	}, [layersMap]);

	const inactiveBaseLayer = useMemo(() => {
		return baseLayers.find((l) => !l.visibility);
	}, [baseLayers]);

	const handleToggleBaselayer = () => {
		if (baseLayers.length !== 2) return;

		const activeLayer = baseLayers.find((l) => l.visibility);
		const inactiveLayer = baseLayers.find((l) => !l.visibility);

		if (!activeLayer || !inactiveLayer) return;

		setLayerVisibility(activeLayer.id, false);
		setLayerVisibility(inactiveLayer.id, true);
	};

	if (baseLayers.length < 2 || !inactiveBaseLayer) return null;

	const previewSrc = inactiveBaseLayer.config?.service?.preview?.src || "";
	const layerName = inactiveBaseLayer.config?.service?.name || "Base Layer";

	return (
		<div className="fixed bottom-6 left-6 z-40">
			<button
				onClick={handleToggleBaselayer}
				className="group relative overflow-hidden rounded-sm border-4 bg-white border-white"
				aria-label={`Switch from ${layerName} to alternate base layer`}
			>
				{previewSrc && (
					<Image
						src={previewSrc}
						alt={layerName}
						width={48}
						height={48}
						loading={inactiveBaseLayer.visibility ? "eager" : "lazy"}
						className="h-12 w-12 object-cover rounded-sm overflow-hidden"
					/>
				)}
				<div className="absolute bottom-0 left-0 right-0 px-2 py-0 bg-black/30 flex gap-1 items-center">
					<Image
						src="/icons/layers.svg"
						alt="Layers"
						width={8}
						height={8}
						className="flex-shrink-0"
					/>
					<p className="text-[8px] text-white truncate">{layerName}</p>
				</div>
			</button>
		</div>
	);
};

export default BaselayerSwitch;
