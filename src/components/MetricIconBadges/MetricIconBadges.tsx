import { getIconComponent, metricIconLabelMap } from "@/lib/helpers/iconMap";

export function MetricIconBadges({ metricIcons }: { metricIcons: string[] }) {
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
