"use client";

import {
	COLOR_MEASURES,
	MiniBarChart,
} from "@/components/ResultCharts/MiniBarChart";
import { ResultStatistics } from "@/types/result";
import { SpinnerIcon } from "@phosphor-icons/react";
import { FC } from "react";

interface WaterBalanceChartProps {
	stats?: ResultStatistics;
	isLoading?: boolean;
}

const WaterBalanceChart: FC<WaterBalanceChartProps> = ({
	stats,
	isLoading,
}) => {
	if (isLoading || !stats) {
		return <SpinnerIcon className="animate-spin" size={24} />;
	}

	const original = stats.water_balance.status_quo[0];
	const with_measures = stats.water_balance.with_measures[0];

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
		<div
			className="border-primary grid overflow-hidden border"
			style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto 1fr" }}
		>
			<div
				className="border-primary border-r border-b p-4"
				style={{ gridColumn: 1, gridRow: 1 }}
			>
				<h2 className="text-xl font-bold">Wasserhaushalt</h2>
			</div>

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
						originalValue={original.delta_w}
						measuresValue={with_measures.delta_w}
						showLegend
						largeValues
					/>
				</div>
			</div>

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
	);
};

export default WaterBalanceChart;
