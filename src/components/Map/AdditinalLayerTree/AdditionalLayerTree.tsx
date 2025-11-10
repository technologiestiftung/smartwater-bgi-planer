"use client";

import { useLayersStore } from "@/store/layers";
import { PlusIcon } from "@phosphor-icons/react";
import { FC, useEffect, useMemo, useRef, useState } from "react";

interface AdditionalLayerTreeProps {}

const AdditionalLayerTree: FC<AdditionalLayerTreeProps> = ({}) => {
	const { layers, setLayerVisibility } = useLayersStore();
	const [viewState, setViewState] = useState<"collapsed" | "open" | "extended">(
		"collapsed",
	);
	const containerRef = useRef<HTMLDivElement>(null);

	const uploadedLayers = useMemo(() => {
		return Array.from(layers.values()).filter(
			(layer) =>
				layer.id.startsWith("uploaded_") ||
				layer.id.startsWith("uploaded_wms_"),
		);
	}, [layers]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setViewState("collapsed");
			}
		};

		if (viewState !== "collapsed") {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [viewState]);

	const handleLayerToggle = (layerId: string, currentVisibility: boolean) => {
		setLayerVisibility(layerId, !currentVisibility);
	};

	const truncateLayerName = (name: string, maxLength: number = 8) => {
		if (name.length <= maxLength) return name;
		return name.substring(0, maxLength) + "...";
	};

	const handleMoreButtonClick = () => {
		if (viewState === "collapsed") {
			setViewState("open");
		} else if (viewState === "open") {
			setViewState("extended");
		}
	};

	const getGridConfig = () => {
		const layerCount = uploadedLayers.length;

		if (viewState === "collapsed") {
			return {
				cols: 1,
				visibleLayers: [],
				showMoreButton: layerCount > 1,
			};
		}

		if (viewState === "open") {
			return {
				cols: 3,
				visibleLayers: uploadedLayers.slice(0, 8),
				showMoreButton: layerCount > 9,
			};
		}
		const cols = Math.ceil(layerCount / 3);

		return {
			cols,
			visibleLayers: uploadedLayers,
			showMoreButton: false,
		};
	};

	if (uploadedLayers.length === 0) return null;

	const { cols, visibleLayers, showMoreButton } = getGridConfig();

	return (
		<div
			ref={containerRef}
			className="AdditionalLayerTree-root bg-background rounded-sm border p-2"
		>
			{viewState === "collapsed" ? (
				showMoreButton && (
					<div
						className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-sm border-2 border-gray-400 bg-gray-50 transition-all hover:border-gray-600 hover:bg-gray-100"
						onClick={handleMoreButtonClick}
					>
						<div className="flex h-full w-full items-center justify-center">
							<PlusIcon className="h-4 w-4 text-gray-400" />
						</div>
						<div className="bg-opacity-70 absolute right-0 bottom-0 left-0 bg-black p-1 text-center text-xs text-white">
							{uploadedLayers.length} layers
						</div>
					</div>
				)
			) : (
				<div
					className="grid gap-2 transition-all duration-300"
					style={{
						gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
						maxHeight: viewState === "extended" ? "12rem" : "auto",
					}}
				>
					{visibleLayers.map((layer) => {
						const displayName =
							layer.config?.name || layer.id.replace(/^uploaded_(?:wms_)?/, "");
						return (
							<div
								key={layer.id}
								className={`relative h-16 w-16 cursor-pointer overflow-hidden rounded-sm border-2 transition-all ${
									layer.visibility
										? "border-blue-500 bg-blue-50"
										: "border-gray-300 bg-gray-100"
								}`}
								onClick={() => handleLayerToggle(layer.id, layer.visibility)}
							>
								<div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-200 to-gray-300">
									<div
										className={`h-8 w-8 rounded ${layer.visibility ? "bg-blue-400" : "bg-gray-400"}`}
									/>
								</div>
								<div className="bg-opacity-70 absolute right-0 bottom-0 left-0 bg-black p-1 text-center text-xs text-white">
									{truncateLayerName(displayName)}
								</div>
							</div>
						);
					})}

					{showMoreButton && (
						<div
							className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-sm border-2 border-dashed border-gray-400 bg-gray-50 transition-all hover:border-gray-600 hover:bg-gray-100"
							onClick={handleMoreButtonClick}
						>
							<div className="flex h-full w-full items-center justify-center">
								<div className="text-2xl font-bold text-gray-400">+</div>
							</div>
							<div className="bg-opacity-70 absolute right-0 bottom-0 left-0 bg-black p-1 text-center text-xs text-white">
								{uploadedLayers.length - visibleLayers.length} more
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default AdditionalLayerTree;
