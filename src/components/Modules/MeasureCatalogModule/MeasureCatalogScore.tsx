"use client";

import { getIconComponent } from "@/lib/helpers/iconMap";
import { cn } from "@/lib/utils";

interface MeasureCatalogScoreProps {
	scores?: Record<string, number>;
	className?: string;
}

export function MeasureCatalogScore({
	scores,
	className,
}: MeasureCatalogScoreProps) {
	if (!scores || Object.keys(scores).length === 0) {
		return null;
	}
	return (
		<div className={cn("flex flex-wrap justify-start gap-2", className)}>
			{scores &&
				Object.keys(scores).map((iconName) => {
					const MetricIcon = getIconComponent(iconName);
					const maxScore = 3;
					const label: Record<string, string> = {
						CloudRain: "Starkregen",
						ThermometerHot: "Stadtklima",
						Drop: "Gewässerschutz",
					};
					const score = scores?.[iconName] ?? 0;
					return (
						<div key={`${iconName}`} className="flex items-center gap-1">
							{Array.from({ length: maxScore }, (_, i) => (
								<span
									key={`${iconName}-${i}`}
									className={cn(
										"bg-neutral-mid border-neutral-mid inline-flex h-6 w-6 items-center justify-center rounded-full border",
										score > i && "bg-primary border-primary",
									)}
								>
									<MetricIcon className="h-4 w-4 text-white" />
								</span>
							))}
							<p>{label[iconName]}</p>
						</div>
					);
				})}
		</div>
	);
}
