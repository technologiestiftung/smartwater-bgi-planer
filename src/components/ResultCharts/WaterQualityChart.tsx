"use client";

import {
	COLOR_MEASURES,
	MiniBarChart,
} from "@/components/ResultCharts/MiniBarChart";
import { PlotType } from "@/server/rabimo/types";
import { ResultStatistics } from "@/types/result";
import { SpinnerIcon } from "@phosphor-icons/react";
import { FC } from "react";
import PlotsDisplay from "../PlotsDisplay/PlotsDisplay";

interface WaterQualityChartProps {
	stats?: ResultStatistics;
	isLoading?: boolean;
	plotUrls: Partial<Record<PlotType, string>>;
	plotState: RequestState;
}

type RequestState = "idle" | "loading" | "success" | "error";

const WaterQualityChart: FC<WaterQualityChartProps> = ({
	stats,
	isLoading,
	plotUrls,
	plotState,
}) => {
	if (isLoading || !stats) {
		return <SpinnerIcon className="animate-spin" size={24} />;
	}

	const runoffReduction = stats.runoff_reduction_percent[0];
	const wqiOrig = stats.water_quality_indicators.status_quo;
	const wqiSim = stats.water_quality_indicators.with_measures;

	return (
		<div
			className="border-primary grid overflow-hidden border"
			style={{
				gridTemplateColumns: "1fr 1fr",
				gridTemplateRows: "65px 130px auto",
			}}
		>
			<div
				className="border-primary flex min-w-[200px] items-center border-r border-b px-2"
				style={{ gridColumn: 1, gridRow: 1 }}
			>
				<h2 className="text-lg font-bold">Gewässerbelastung</h2>
			</div>

			<div
				className="border-primary flex flex-col justify-center border-r px-2"
				style={{ gridColumn: 1, gridRow: 2 }}
			>
				<p
					className="translate-y-4 text-sm leading-tight font-bold"
					style={{ color: COLOR_MEASURES }}
				>
					MWÜ Volumen
					<br />
					(m³)
				</p>
				<div className="flex flex-1 -translate-y-4 items-center justify-end">
					<MiniBarChart
						originalValue={wqiOrig.overflow_volume[0]}
						measuresValue={wqiSim.overflow_volume[0]}
						showLegend
						largeValues
						maxHeight={96}
					/>
				</div>
			</div>

			<div
				className="flex flex-col divide-y divide-gray-200"
				style={{ gridColumn: 2, gridRow: "1 / 3" }}
			>
				<div className="flex max-h-[65px] flex-1 items-center justify-between px-2">
					<span className="text-sm leading-tight font-semibold text-gray-700">
						Abkopplung
						<br />
						<span className="font-normal">(Prozent)</span>
					</span>
					<span className="mr-2 text-3xl leading-none font-bold">
						{runoffReduction.toLocaleString("de-DE", {
							maximumFractionDigits: 1,
						})}
					</span>
				</div>
				<div className="flex max-h-[65px] flex-1 items-center justify-between px-2">
					<span className="text-sm leading-tight font-semibold text-gray-700">
						Unterschreitungs&shy;dauer
						<br />
						<span className="font-normal">(Stunden)</span>
					</span>
					<MiniBarChart
						originalValue={wqiOrig.critical_hours[0]}
						measuresValue={wqiSim.critical_hours[0]}
					/>
				</div>
				<div className="flex max-h-[65px] flex-1 items-center justify-between px-2">
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
			<div style={{ gridColumn: "1 / 3", gridRow: 3 }}>
				<PlotsDisplay plotUrls={plotUrls} isLoading={plotState === "loading"} />
			</div>
		</div>
	);
};

export default WaterQualityChart;
