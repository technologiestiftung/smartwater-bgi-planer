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
		<div>
			<button
				onClick={handleToggleBaselayer}
				className="group relative h-14 w-14 overflow-hidden rounded-sm border-4 border-white bg-white"
				aria-label={`Switch from ${layerName} to alternate base layer`}
			>
				{previewSrc && (
					<Image
						src={previewSrc}
						alt={layerName}
						fill
						loading={inactiveBaseLayer.visibility ? "eager" : "lazy"}
						className="h-12 w-12 overflow-hidden rounded-sm object-cover"
					/>
				)}
				<div className="absolute right-0 bottom-0 left-0 flex items-center gap-1 bg-black/30 px-2 py-0">
					<Image
						src="/icons/layers.svg"
						alt="Layers"
						width={8}
						height={8}
						className="shrink-0"
					/>
					<p className="truncate text-[8px] text-white">{layerName}</p>
				</div>
			</button>
		</div>
	);
};

export default BaselayerSwitch;
