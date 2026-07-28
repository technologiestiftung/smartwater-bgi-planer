"use client";

import { PageModal } from "@/components/Modal/Modal";
import { PLOT_TYPES, PlotType } from "@/server/rabimo/types";
import { SpinnerIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { FC, useState } from "react";

const PLOT_LABELS: Record<PlotType, string> = {
	critical_hours: "Unterschreitungsdauer in Stunden (1,5 mg/L)",
	critical_events: "Kritische Sauerstoffereignisse (Anzahl)",
};

interface PlotsDisplayProps {
	plotUrls: Partial<Record<PlotType, string>>;
	isLoading: boolean;
}

const PlotsDisplay: FC<PlotsDisplayProps> = ({ plotUrls, isLoading }) => {
	const [selectedPlot, setSelectedPlot] = useState<PlotType | null>(null);

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
			<div className="flex gap-4">
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
			>
				{selectedBase64 && (
					<Image
						src={`data:image/png;base64,${selectedBase64}`}
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
