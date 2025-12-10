"use client";

import { useLayersStore } from "@/store/layers";
import Image from "next/image";
import { FC, useCallback, useMemo } from "react";

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

	const activeBaseLayer = useMemo(() => {
		return baseLayers.find((l) => l.visibility);
	}, [baseLayers]);

	const handleToggleBaselayer = useCallback(() => {
		if (baseLayers.length !== 2 || !activeBaseLayer || !inactiveBaseLayer)
			return;

		setLayerVisibility(activeBaseLayer.id, false);
		setLayerVisibility(inactiveBaseLayer.id, true);
	}, [
		baseLayers.length,
		activeBaseLayer,
		inactiveBaseLayer,
		setLayerVisibility,
	]);

	if (baseLayers.length < 2) return null;
	if (!inactiveBaseLayer) return null;

	const previewSrc = inactiveBaseLayer.config?.service?.preview?.src || "";
	const layerName = inactiveBaseLayer.config?.service?.name || "Base Layer";

	return (
		<button
			onClick={handleToggleBaselayer}
			className="BaselayerSwitch-root group border-background bg-background relative h-14 w-14 cursor-pointer overflow-hidden rounded-sm border-4"
			aria-label={`Switch from ${layerName} to alternate base layer`}
		>
			{previewSrc && (
				<Image
					src={previewSrc}
					alt={layerName}
					fill
					sizes="48px"
					loading="eager"
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
	);
};

export default BaselayerSwitch;
