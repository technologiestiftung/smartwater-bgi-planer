import { FC } from "react";

interface FeatureModalProps {
	attributes: Record<string, any> | null;
	layerId: string | null;
	onClose: () => void;
}

const FeatureModal: FC<FeatureModalProps> = ({
	attributes,
	layerId,
	onClose,
}) => {
	if (!attributes) return null;

	return (
		<div className="FeatureModal-root fixed inset-0 z-9999 flex items-center justify-center bg-black/50">
			<div className="bg-background w-full max-w-2xl rounded-lg shadow-2xl">
				<div className="flex items-center justify-between border-b p-4">
					<h2 className="text-xl font-bold">Feature Details</h2>
					<button onClick={onClose} className="text-2xl hover:opacity-70">
						×
					</button>
				</div>
				<div className="max-h-[70vh] overflow-y-auto p-6">
					<div className="text-muted-foreground mb-4 font-mono text-sm">
						Layer: {layerId}
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{Object.entries(attributes).map(([key, value]) => (
							<div key={key} className="border-b pb-2">
								<div className="text-xs font-semibold text-gray-500 uppercase">
									{key}
								</div>
								<div className="text-sm">{value?.toString() || "—"}</div>
							</div>
						))}
					</div>
				</div>
				<div className="flex justify-end border-t p-4">
					<button
						onClick={onClose}
						className="bg-primary text-primary-foreground rounded px-4 py-2"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default FeatureModal;
