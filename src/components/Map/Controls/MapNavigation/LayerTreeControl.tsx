"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ContextMapIcon from "@/icons/fachkarten.svg";
import { useLayersStore } from "@/store/layers";
import { ManagedLayer } from "@/store/layers/types";
import { useUiStore } from "@/store/ui";
import Image from "next/image";
import { FC, useMemo } from "react";

const LayerTreeControl: FC = () => {
	const layers = useLayersStore((state) => state.layers);
	const setIsLayerTreeOpen = useUiStore((state) => state.setIsLayerTreeOpen);

	const subjectLayers = useMemo(
		() => Array.from(layers.values()).filter((l) => l.layerType === "subject"),
		[layers],
	);

	const visibleSubjectLayers = useMemo(
		() => subjectLayers.filter((l) => l.visibility),
		[subjectLayers],
	);

	const topVisibleLayer = useMemo(() => {
		return visibleSubjectLayers.reduce(
			(topLayer, currentLayer) => {
				return !topLayer || currentLayer.zIndex > topLayer.zIndex
					? currentLayer
					: topLayer;
			},
			null as ManagedLayer | null,
		);
	}, [visibleSubjectLayers]);

	const visibleCount = visibleSubjectLayers.length;

	const handleLayerTreeOpen = () => {
		setIsLayerTreeOpen(true);
	};

	const renderThumbnail = () => {
		if (topVisibleLayer?.config?.service?.preview?.src) {
			return (
				<Image
					src={topVisibleLayer.config.service.preview.src}
					alt={topVisibleLayer.config.service.name || "Layer preview"}
					width={64}
					height={64}
					className="w-full h-full object-cover"
				/>
			);
		}
		return (
			<div className="w-full h-full bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center">
				<div className="w-6 h-6 border-2 border-purple-400 rounded-full opacity-50"></div>
			</div>
		);
	};

	return (
		<div className="relative">
			<Button
				variant="map-control"
				size="icon-only"
				onClick={handleLayerTreeOpen}
				className={`relative w-12 h-12 p-0 bg-neutral-80 overflow-hidden cursor-pointer`}
			>
				<div className="w-full h-full flex items-center justify-center">
					{visibleCount === 0 && (
						<ContextMapIcon className="[&>path]:fill-popover" />
					)}
					{visibleCount >= 1 && renderThumbnail()}
				</div>
			</Button>

			{visibleCount > 0 && (
				<Badge
					variant="default"
					className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full text-xs font-bold"
				>
					{visibleCount}
				</Badge>
			)}
		</div>
	);
};

export default LayerTreeControl;
