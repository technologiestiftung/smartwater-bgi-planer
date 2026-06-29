"use client";

import { useResultStore, useScenarioStore } from "@/store";
import { FC } from "react";

interface SummaryEntry {
	total_area_m2: number;
	runoff: number;
	infiltr: number;
	evapor: number;
	delta: number;
}

interface ResultSummary {
	original: SummaryEntry;
	with_measures: SummaryEntry;
}

const COLOR_ORIGINAL = "#6db08a";
const COLOR_MEASURES = "#1e4d35";
const COLOR_LEGEND = "#B3B3B3";
const BAR_MAX_HEIGHT = 72;
const BAR_WIDTH = 16;

interface MiniBarChartProps {
	originalValue: number;
	measuresValue: number;
	showLegend?: boolean;
	largeValues?: boolean;
}

const MiniBarChart: FC<MiniBarChartProps> = ({
	originalValue,
	measuresValue,
	showLegend = false,
	largeValues = false,
}) => {
	const max = Math.max(originalValue, measuresValue, 1);
	const origHeight = (originalValue / max) * BAR_MAX_HEIGHT;
	const measHeight = (measuresValue / max) * BAR_MAX_HEIGHT;
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
			<span className={`${valueClass} self-end pr-1`}>
				{Math.round(originalValue)}
			</span>
			<div
				style={{
					height: origHeight,
					backgroundColor: COLOR_ORIGINAL,
					borderRadius: "4px 4px 0 0",
					alignSelf: "end",
				}}
			/>
			<div
				style={{
					height: measHeight,
					backgroundColor: COLOR_MEASURES,
					borderRadius: "4px 4px 0 0",
					alignSelf: "end",
				}}
			/>
			<span className={`${valueClass} self-end pl-1`}>
				{Math.round(measuresValue)}
			</span>

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

interface ResultChartProps {}

const ResultChart: FC<ResultChartProps> = () => {
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const result = useResultStore((state) =>
		activeScenarioId ? state.resultsByScenarioId[activeScenarioId] : undefined,
	);

	if (!result) {
		return (
			<div className="ResultChart-root text-muted-foreground p-4 text-sm">
				Kein Ergebnis verfügbar.
			</div>
		);
	}

	const { original, with_measures } = result.data.summary as ResultSummary;

	const metrics = [
		{
			label: "Oberfl. Abfluss",
			unit: "mm/a",
			orig: original.runoff,
			sim: with_measures.runoff,
		},
		{
			label: "Versickerung",
			unit: "mm/a",
			orig: original.infiltr,
			sim: with_measures.infiltr,
		},
		{
			label: "Verdunstung",
			unit: "mm/a",
			orig: original.evapor,
			sim: with_measures.evapor,
		},
	];

	return (
		<div className="ResultChart-root">
			<div
				className="border-primary grid overflow-hidden border"
				style={{
					gridTemplateColumns: "1fr 1fr",
					gridTemplateRows: "auto 1fr",
				}}
			>
				{/* Top-left: title */}
				<div
					className="border-primary border-r border-b p-4"
					style={{ gridColumn: 1, gridRow: 1 }}
				>
					<h2 className="text-xl font-bold">Wasserhaushalt</h2>
				</div>

				{/* Bottom-left: Delta-W */}
				<div
					className="border-primary flex flex-col border-r p-4"
					style={{ gridColumn: 1, gridRow: 2 }}
				>
					<p
						className="mb-3 text-sm leading-tight font-bold"
						style={{ color: COLOR_MEASURES }}
					>
						Delta-W
						<br />
						(%)
					</p>
					<div className="flex flex-1 items-center justify-center">
						<MiniBarChart
							originalValue={original.delta}
							measuresValue={with_measures.delta}
							showLegend
							largeValues
						/>
					</div>
				</div>

				{/* Right column: 3 metric cells spanning both rows */}
				<div
					className="flex flex-col divide-y divide-gray-200"
					style={{ gridColumn: 2, gridRow: "1 / 3" }}
				>
					{metrics.map(({ label, unit, orig, sim }) => (
						<div
							key={label}
							className="flex flex-1 items-center justify-between p-4"
						>
							<span className="text-sm leading-tight font-semibold text-gray-700">
								{label}
								<br />
								<span className="font-normal">({unit})</span>
							</span>
							<MiniBarChart originalValue={orig} measuresValue={sim} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ResultChart;
