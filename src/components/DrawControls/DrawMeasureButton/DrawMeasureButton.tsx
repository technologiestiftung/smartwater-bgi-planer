"use client";

import MeasureInfos from "@/components/MeasureInfos/MeasureInfos";
import { Button } from "@/components/ui/button";
import { PolygonIcon } from "@phosphor-icons/react";
import { FC } from "react";
import { useDrawMeasure } from "./useDrawMeasure";

export const DrawMeasureButton: FC = () => {
	const { isDrawing, canDraw, liveMeasureInfo, label, toggleDraw } =
		useDrawMeasure();

	return (
		<div className="relative">
			<Button
				variant="outline"
				onClick={toggleDraw}
				disabled={!isDrawing && !canDraw}
			>
				<PolygonIcon />
				{label}
			</Button>
			{isDrawing && liveMeasureInfo && (
				<MeasureInfos liveMeasureInfo={liveMeasureInfo} />
			)}
		</div>
	);
};
