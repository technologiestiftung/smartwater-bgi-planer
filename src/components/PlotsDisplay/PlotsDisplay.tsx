"use client";

import { PageModal } from "@/components/Modal/Modal";
import { PLOT_TYPES, PlotType } from "@/server/rabimo/types";
import { SpinnerIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { FC, useState } from "react";
import { Button } from "../ui/button";

const PLOT_LABELS: Record<PlotType, string> = {
	critical_hours: "Unterschreitungsdauer in Stunden (1,5 mg/L)",
	critical_events: "Kritische Sauerstoffereignisse (Anzahl)",
};

const TOGGLE_LABELS: string[] = ["Ist-Zustand", "Simulation"];

const STATUS_QUO_IMAGES: Record<PlotType, string> = {
	critical_hours: "/images/Unterschreitung_Ist_Zustand.png",
	critical_events: "/images/Kritische_Ereignisse_Ist_Zustand.png",
};

interface PlotsDisplayProps {
	plotUrls: Partial<Record<PlotType, string>>;
	isLoading: boolean;
}

const PlotsDisplay: FC<PlotsDisplayProps> = ({ plotUrls, isLoading }) => {
	const [selectedPlot, setSelectedPlot] = useState<PlotType | null>(null);
	const [activeSimulation, setActiveSimulation] = useState<string>(
		TOGGLE_LABELS[1],
	);

	if (isLoading) {
		return (
			<div className="text-muted-foreground flex items-center gap-2 text-sm">
				<SpinnerIcon className="animate-spin" size={24} />
			</div>
		);
	}

	if (Object.keys(plotUrls).length === 0) return null;

	const selectedBase64 = selectedPlot ? plotUrls[selectedPlot] : null;

	return (
		<>
			<div className="border-primary flex divide-x divide-gray-200 border-t">
				{PLOT_TYPES.map((type) => {
					const base64 = plotUrls[type];
					if (!base64) return null;
					return (
						<button
							key={type}
							type="button"
							className="cursor-zoom-in text-left"
							onClick={() => setSelectedPlot(type)}
						>
							<p className="text-primary caption m-2 font-bold">
								{PLOT_LABELS[type]}
							</p>
							<Image
								src={`data:image/png;base64,${base64}`}
								alt={PLOT_LABELS[type]}
								width={620}
								height={400}
								unoptimized
								className="h-auto max-w-full"
							/>
						</button>
					);
				})}
			</div>

			<PageModal
				open={selectedPlot !== null}
				onOpenChange={(open) => {
					if (!open) setSelectedPlot(null);
				}}
				title={selectedPlot ? PLOT_LABELS[selectedPlot] : ""}
				className="max-w-5xl"
			>
				<div className="flex w-full justify-end gap-2">
					{TOGGLE_LABELS.map((label, index) => (
						<Button
							key={index}
							variant={activeSimulation === label ? "default" : "outline"}
							size="sm"
							onClick={() => setActiveSimulation(label)}
							className="text-sm"
						>
							{label}
						</Button>
					))}
				</div>
				{selectedBase64 && activeSimulation === TOGGLE_LABELS[1] && (
					<Image
						src={`data:image/png;base64,${selectedBase64}`}
						alt={selectedPlot ? PLOT_LABELS[selectedPlot] : ""}
						width={800}
						height={520}
						unoptimized
						className="h-auto w-full"
					/>
				)}
				{selectedBase64 &&
					activeSimulation === TOGGLE_LABELS[0] &&
					!!STATUS_QUO_IMAGES[selectedPlot as PlotType] && (
						<Image
							src={STATUS_QUO_IMAGES[selectedPlot as PlotType]}
							alt={selectedPlot ? PLOT_LABELS[selectedPlot] : ""}
							width={800}
							height={520}
							unoptimized
							className="h-auto w-full"
						/>
					)}
			</PageModal>
		</>
	);
};

export default PlotsDisplay;
