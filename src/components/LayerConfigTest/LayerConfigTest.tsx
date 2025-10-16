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
		<div className="LayerConfigText-root bg-white max-w-72 h-[600px] overflow-scroll p-4 shadow-lg rounded-lg">
			<h1 className="text-xl font-bold mb-4">Module Layer Control</h1>
			{layerConfig.length === 0 ? (
				<p className="text-gray-600">Loading module configurations...</p>
			) : (
				<div className="space-y-2">
					{layerConfig.map((configItem: LayerConfigItem) => (
						<div
							key={configItem.id}
							className="flex flex-col border p-3 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer"
							onClick={() => handleModuleClick(configItem.id)}
						>
							<h2 className="text-lg font-semibold">{configItem.name}</h2>
							{configItem.description && (
								<p className="text-sm text-gray-700">
									{configItem.description}
								</p>
							)}
							<span className="text-xs text-blue-500 mt-1">
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
