"use client";

import { useLayersStore } from "@/store/layers";
import { LayerConfigItem } from "@/store/layers/types";
import { FC } from "react";

const LayerConfigTest: FC = () => {
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);

	const handleModuleClick = (configId: string) => {
		applyConfigLayers(configId);
	};

	return (
		<div className="LayerConfigText-root h-[600px] max-w-72 overflow-scroll rounded-lg bg-white p-4 shadow-lg">
			<h1 className="mb-4 text-xl font-bold">Module Layer Control</h1>
			{layerConfig.length === 0 ? (
				<p className="text-gray-600">Loading module configurations...</p>
			) : (
				<div className="space-y-2">
					{layerConfig.map((configItem: LayerConfigItem) => (
						<div
							key={configItem.id}
							className="flex cursor-pointer flex-col rounded-md border bg-gray-50 p-3 hover:bg-gray-100"
							onClick={() => handleModuleClick(configItem.id)}
						>
							<h2 className="text-lg font-semibold">{configItem.name}</h2>
							{configItem.description && (
								<p className="text-sm text-gray-700">
									{configItem.description}
								</p>
							)}
							<span className="mt-1 text-xs text-blue-500">
								Click to apply layers
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default LayerConfigTest;
