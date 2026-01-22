import { XCircleIcon } from "@phosphor-icons/react";
import { FC } from "react";

interface FeatureTooltipProps {
	attributes: Record<string, any>;
	layerId: string;
	onClose: () => void;
}

const FeatureTooltip: FC<FeatureTooltipProps> = ({ attributes, onClose }) => {
	return (
		<div className="FeatureTooltip-root bg-background w-[409px] shadow-lg">
			<div className="border-muted flex h-8 w-full items-center justify-between border-b pl-2">
				<h3 className="text-sm font-semibold">
					Attribute dieser Region / Blockteilfläche
				</h3>
				<button
					className="bg-secondary flex h-8 w-8 items-center justify-center text-white"
					onClick={onClose}
				>
					<XCircleIcon />
				</button>
			</div>
			<div className="max-h-[184px] overflow-y-scroll p-3">
				{Object.keys(attributes).length === 0 ? (
					<p className="text-sm text-gray-600">No attributes found</p>
				) : (
					<div className="space-y-1">
						{Object.entries(attributes).map(([key, value]) => (
							<div
								key={key}
								className="border-muted grid grid-cols-3 border-b text-sm"
							>
								<span className="col-span-2 pb-1 font-medium">{key}:</span>
								<span className="col-span-1 ml-2 text-gray-900">
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
