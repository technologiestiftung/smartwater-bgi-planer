"use client";

import { FC } from "react";

export const COLOR_MEASURES = "#1e4d35";
const COLOR_ORIGINAL = "#6db08a";
const COLOR_LEGEND = "#B3B3B3";
const BAR_MAX_HEIGHT = 72;
const BAR_WIDTH = 16;

interface MiniBarChartProps {
	originalValue: number;
	measuresValue: number;
	showLegend?: boolean;
	largeValues?: boolean;
}

export const MiniBarChart: FC<MiniBarChartProps> = ({
	originalValue,
	measuresValue,
	showLegend = false,
	largeValues = false,
}) => {
	const roundedOrig = Math.round(originalValue);
	const roundedMeas = Math.round(measuresValue);
	const max = Math.max(roundedOrig, roundedMeas, 1);
	const origHeight = (roundedOrig / max) * BAR_MAX_HEIGHT;
	const measHeight = (roundedMeas / max) * BAR_MAX_HEIGHT;

	const valueClass = largeValues
		? "text-3xl font-bold leading-none"
		: "text-base font-bold leading-none";

	return (
		<div
			className="inline-grid gap-x-1 gap-y-1"
			style={{
				gridTemplateColumns: `auto ${BAR_WIDTH}px ${BAR_WIDTH}px auto`,
				alignItems: "end",
			}}
		>
			{/* Row 1: value | bar | bar | value */}
			<span className={`${valueClass} self-end pr-1`}>{roundedOrig}</span>
			<div
				className="self-end rounded-sm"
				style={{
					height: origHeight,
					backgroundColor: COLOR_ORIGINAL,
				}}
			/>
			<div
				className="self-end rounded-sm"
				style={{
					height: measHeight,
					backgroundColor: COLOR_MEASURES,
				}}
			/>
			<span className={`${valueClass} self-end pl-1`}>{roundedMeas}</span>

			{/* Row 2: legend boxes aligned directly under bars */}
			{showLegend && (
				<>
					<span className="pr-1 text-xs whitespace-nowrap text-gray-600">
						Ist-Zustand
					</span>
					<div
						className="rounded-sm"
						style={{
							width: BAR_WIDTH,
							height: BAR_WIDTH,
							backgroundColor: COLOR_LEGEND,
						}}
					/>
					<div
						className="rounded-sm"
						style={{
							width: BAR_WIDTH,
							height: BAR_WIDTH,
							backgroundColor: COLOR_LEGEND,
						}}
					/>
					<span className="pl-1 text-xs whitespace-nowrap text-gray-600">
						Simulation
					</span>
				</>
			)}
		</div>
	);
};
