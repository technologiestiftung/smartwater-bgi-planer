"use client";

import { Button } from "@/components/ui/button";
import { ensureVectorLayer, fitMapToExtent } from "@/lib/helpers/ol";
import { useMapStore } from "@/store/map";
import { LAYER_IDS } from "@/types";
import Image from "next/image";
import { FC, useCallback } from "react";

interface ProjectBoundaryControlProps {}

const ProjectBoundaryControl: FC<ProjectBoundaryControlProps> = ({}) => {
	const map = useMapStore((state) => state.map);

	const handleBoundaryLocate = useCallback(() => {
		if (!map) return;

		const layer = ensureVectorLayer(map, LAYER_IDS.PROJECT_BOUNDARY);
		fitMapToExtent(map, layer);
	}, [map]);

	if (!map) return null;

	return (
		<div className="ProjectBoundaryControl-root">
			<Button
				variant="map-control"
				size="icon-only"
				onClick={handleBoundaryLocate}
				className="cursor-pointer"
			>
				<Image
					src="/icons/mapPin.svg"
					alt="Projekt Layer"
					width={24}
					height={24}
				/>
			</Button>
		</div>
	);
};

export default ProjectBoundaryControl;
