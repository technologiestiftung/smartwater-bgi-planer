import { FC } from "react";

interface FeatureTooltipProps {
	attributes: Record<string, any>;
	layerId: string;
	onClose: () => void;
}

const FeatureTooltip: FC<FeatureTooltipProps> = ({
	attributes,
	layerId,
	onClose,
}) => {
	return (
		<div className="FeatureTooltip-root bg-background w-[325px] shadow-lg">
			<div className="border-muted flex h-8 w-full items-center justify-between border-b pl-2">
				<h3 className="text-sm font-semibold">Feature Info</h3>
				<button
					className="bg-secondary flex h-8 w-8 items-center justify-center text-white"
					onClick={onClose}
				>
					×
				</button>
			</div>
			<div className="p-3">
				<div className="mb-2 text-xs text-gray-500">Layer: {layerId}</div>
				{Object.keys(attributes).length === 0 ? (
					<p className="text-sm text-gray-600">No attributes found</p>
				) : (
					<div className="space-y-1">
						{Object.entries(attributes).map(([key, value]) => (
							<div key={key} className="text-sm">
								<span className="font-medium text-gray-700">{key}:</span>
								<span className="ml-2 text-gray-900">
									{value !== null && value !== undefined ? String(value) : "—"}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default FeatureTooltip;
