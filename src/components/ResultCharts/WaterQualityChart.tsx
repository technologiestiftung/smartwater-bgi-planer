"use client";

import {
	COLOR_MEASURES,
	MiniBarChart,
} from "@/components/ResultCharts/MiniBarChart";
import { ResultStatistics } from "@/types/result";
import { SpinnerIcon } from "@phosphor-icons/react";
import { FC } from "react";

interface WaterQualityChartProps {
	stats?: ResultStatistics;
	isLoading?: boolean;
}

const WaterQualityChart: FC<WaterQualityChartProps> = ({
	stats,
	isLoading,
}) => {
	if (isLoading || !stats) {
		return <SpinnerIcon className="animate-spin" size={24} />;
	}

	const runoffReduction = stats.runoff_reduction_percent[0] ?? 0;
	const wqiOrig = stats.water_quality_indicators.status_quo ?? 0;
	const wqiSim = stats.water_quality_indicators.with_measures ?? 0;

	return (
		<div
			className="border-primary grid overflow-hidden border"
			style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto 1fr" }}
		>
			<div
				className="border-primary border-r border-b p-4"
				style={{ gridColumn: 1, gridRow: 1 }}
			>
				<h2 className="text-xl font-bold">Gewässerbelastung</h2>
			</div>

			<div
				className="border-primary flex flex-col border-r p-4"
				style={{ gridColumn: 1, gridRow: 2 }}
			>
				<p
					className="mb-3 text-sm leading-tight font-bold"
					style={{ color: COLOR_MEASURES }}
				>
					MWÜ Volumen
					<br />
					(m³)
				</p>
				<div className="flex flex-1 items-center justify-center">
					<MiniBarChart
						originalValue={wqiOrig.overflow_volume[0]}
						measuresValue={wqiSim.overflow_volume[0]}
						showLegend
						largeValues
					/>
				</div>
			</div>

			<div
				className="flex flex-col divide-y divide-gray-200"
				style={{ gridColumn: 2, gridRow: "1 / 3" }}
			>
				<div className="flex flex-1 items-center justify-between p-4">
					<span className="text-sm leading-tight font-semibold text-gray-700">
						Abkopplung
						<br />
						<span className="font-normal">(Prozent)</span>
					</span>
					<span className="text-3xl leading-none font-bold">
						{runoffReduction.toLocaleString("de-DE", {
							maximumFractionDigits: 1,
						})}
					</span>
				</div>
				<div className="flex flex-1 items-center justify-between p-4">
					<span className="text-sm leading-tight font-semibold text-gray-700">
						Unterschreitungsdauer
						<br />
						<span className="font-normal">(Stunden)</span>
					</span>
					<MiniBarChart
						originalValue={wqiOrig.critical_hours[0]}
						measuresValue={wqiSim.critical_hours[0]}
					/>
				</div>
				<div className="flex flex-1 items-center justify-between p-4">
					<span className="text-sm leading-tight font-semibold text-gray-700">
						Kritische O₂ Ereignisse
						<br />
						<span className="font-normal">(Anzahl)</span>
					</span>
					<MiniBarChart
						originalValue={wqiOrig.critical_events[0]}
						measuresValue={wqiSim.critical_events[0]}
					/>
				</div>
			</div>
		</div>
	);
};

export default WaterQualityChart;
