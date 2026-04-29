"use client";

import { RichTextWithLinks } from "@/components/RichTextWithLinks/RichTextWithLinks";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getIconComponent, metricIconLabelMap } from "@/lib/helpers/iconMap";
import { LayerConfigItem } from "@/store/layers/types";
import Image from "next/image";

function MetricIconBadges({ metricIcons }: { metricIcons: string[] }) {
	if (metricIcons.length === 0) return null;
	return (
		<div className="mb-3 flex flex-wrap gap-2">
			{metricIcons.map((iconName) => {
				const MetricIcon = getIconComponent(iconName);
				const label = metricIconLabelMap[iconName] ?? iconName;
				return (
					<span
						key={iconName}
						className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
					>
						<MetricIcon className="h-4 w-4" />
						{label}
					</span>
				);
			})}
		</div>
	);
}

interface MeasurePlaningStepContentProps {
	layerConfig: LayerConfigItem;
	metricIcons?: string[];
}

export function MeasurePlaningStepContent({
	layerConfig,
	metricIcons = [],
}: MeasurePlaningStepContentProps) {
	const showLegendAccordion =
		Boolean(layerConfig.legendSrc) || Boolean(layerConfig.canDrawMeasures);
	
	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mt-4">
				<div className="mb-4">
					<MetricIconBadges metricIcons={metricIcons} />
					{layerConfig.question && (
						<p className="mb-2 font-semibold">{layerConfig.question}</p>
					)}
					{layerConfig.description && (
						<div className="wrap-break-word">
							<RichTextWithLinks text={layerConfig.description} />
						</div>
					)}

					{/* todo : add confirm button logic */}
					<div className="mt-6">
						<Button>Bestätigen</Button>
					</div>
				</div>
			</div>

			{showLegendAccordion && (
				<div className="mt-auto pt-6 pb-4">
					<Accordion type="multiple">
						<AccordionItem value="legend" className="border-neutral-mid px-4">
							<AccordionTrigger className="text-primary font-bold hover:no-underline">
								{layerConfig.legendTitle || "Legende"}
							</AccordionTrigger>
							<AccordionContent className="pb-4">
								{layerConfig.legendSrc ? (
									<Image
										src={layerConfig.legendSrc}
										alt="Legende für die Karte"
										width={620}
										height={260}
										className="h-auto max-w-full"
									/>
								) : (
									<p className="text-muted-foreground text-sm">
										Keine Legende verfügbar.
									</p>
								)}
							</AccordionContent>
						</AccordionItem>

						{layerConfig.canDrawMeasures && (
							<AccordionItem
								value="measures"
								className="border-neutral-mid px-4"
							>
								<AccordionTrigger className="text-primary font-bold hover:no-underline">
									Maßnahmen
								</AccordionTrigger>
								<AccordionContent>
									{layerConfig.measurementSrc ? (
										<Image
											src={layerConfig.measurementSrc}
											alt="Legende für Maßnahmen"
											width={620}
											height={260}
											className="h-auto max-w-full"
										/>
									) : (
										<p className="text-muted-foreground text-sm">
											Keine Maßnahmenlegende verfügbar.
										</p>
									)}
								</AccordionContent>
							</AccordionItem>
						)}
					</Accordion>
				</div>
			)}
		</div>
	);
}
