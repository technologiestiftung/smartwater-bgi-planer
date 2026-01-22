"use client";

import { useLayersStore } from "@/store/layers";
import { useUiStore } from "@/store/ui";
import { StackIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

const AdditionalLayerTree: FC = ({}) => {
	const { layers, setLayerVisibility } = useLayersStore(
		useShallow((state) => ({
			layers: state.layers,
			setLayerVisibility: state.setLayerVisibility,
		})),
	);
	const isAdditionalLayerTreeVisible = useUiStore(
		(state) => state.isAdditionalLayerTreeVisible,
	);
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

	const handleMoreButtonClick = () => {
		if (viewState === "collapsed") {
			setViewState("open");
		} else if (viewState === "open") {
			setViewState("extended");
		}
	};

	const getGridConfig = () => {
		const layerCount = uploadedLayers.length;

		// if (viewState === "collapsed") {
		// 	return {
		// 		cols: 1,
		// 		rows: 1,
		// 		visibleLayers: uploadedLayers.slice(0, 1),
		// 		showMoreButton: layerCount > 1,
		// 	};
		// }

		if (viewState === "open" || viewState === "collapsed") {
			const maxVisible = 8;
			return {
				cols: layerCount < 3 ? layerCount : 3,
				rows: 3,
				visibleLayers: uploadedLayers.slice(0, maxVisible),
				showMoreButton: layerCount > maxVisible,
			};
		}

		const rows = Math.ceil(layerCount / 3);
		return {
			cols: 3,
			rows,
			visibleLayers: uploadedLayers,
			showMoreButton: false,
		};
	};

	if (uploadedLayers.length === 0) return null;

	const { cols, visibleLayers, showMoreButton } = getGridConfig();

	return (
		<div
			ref={containerRef}
			className="pointer-events-none absolute bottom-0 left-[calc(100%+0.5rem)] flex items-end transition-opacity duration-300"
			style={{
				opacity: isAdditionalLayerTreeVisible ? 1 : 0,
			}}
		>
			<div
				className="bg-background pointer-events-auto grid h-fit w-fit gap-1 rounded-sm p-1 shadow-sm"
				style={{
					gridTemplateColumns: `repeat(${cols}, 48px)`,
				}}
			>
				{visibleLayers.map((layer) => {
					const displayName =
						layer.config?.name || layer.id.replace(/^uploaded_(?:wms_)?/, "");

					return (
						<button
							key={layer.id}
							className="relative h-12 w-12 cursor-pointer overflow-hidden rounded-sm transition-all"
							onClick={() => handleLayerToggle(layer.id, layer.visibility)}
							title={displayName}
						>
							<div className="flex h-full items-center justify-center">
								<Image
									src={
										layer.olLayer?.get("previewUrl") ||
										"/preview-img/basemap-grau.png"
									}
									loading="lazy"
									alt={displayName}
									width={48}
									height={48}
									className="h-full w-full object-cover"
								/>
							</div>
							{layer.visibility && (
								<div className="border-accent pointer-events-none absolute inset-0 rounded-sm border" />
							)}
							<div className="absolute inset-x-0 bottom-0 truncate bg-black/30 px-2 py-1 text-[8px] text-white">
								{displayName}
							</div>
						</button>
					);
				})}

				{showMoreButton && (
					<button
						className="relative h-12 w-12 rounded border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-gray-400 hover:bg-gray-100"
						onClick={handleMoreButtonClick}
					>
						<div className="flex h-full flex-col items-center justify-center">
							<StackIcon className="h-5 w-5 text-gray-400" weight="duotone" />
							<span className="mt-0.5 text-xs text-gray-500">
								+{uploadedLayers.length - visibleLayers.length}
							</span>
						</div>
					</button>
				)}
			</div>
		</div>
	);
};

export default AdditionalLayerTree;
