"use client";

import { useLayersStore } from "@/store/layers";
import { useUiStore } from "@/store/ui";
import { StackIcon, XCircleIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

const LayerTree: FC = ({}) => {
	const { layers, setLayerVisibility } = useLayersStore(
		useShallow((state) => ({
			layers: state.layers,
			setLayerVisibility: state.setLayerVisibility,
		})),
	);
	const isLayerTreeVisible = useUiStore((state) => state.isLayerTreeVisible);
	const [viewState, setViewState] = useState<"collapsed" | "open" | "extended">(
		"collapsed",
	);
	const containerRef = useRef<HTMLDivElement>(null);

	// Eigene/Hochgeladene Layer
	const uploadedLayers = useMemo(() => {
		return Array.from(layers.values()).filter(
			(layer) =>
				layer.id.startsWith("uploaded_") ||
				layer.id.startsWith("uploaded_wms_"),
		);
	}, [layers]);

	// Fachdaten / Weitere Layer
	const subjectLayers = useMemo(() => {
		return Array.from(layers.values()).filter(
			(l) => l.layerType === "subject" && !l.id.startsWith("uploaded_"),
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
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [viewState]);

	const handleLayerToggle = (layerId: string, currentVisibility: boolean) => {
		setLayerVisibility(layerId, !currentVisibility);
	};

	const handleMoreButtonClick = () => {
		setViewState(viewState === "extended" ? "open" : "extended");
	};

	// Gemeinsame Komponente für die Grid-Buttons im Extended-Menü
	const LayerIconButton = ({ layer }: { layer: any }) => {
		const displayName =
			layer.config?.name ||
			layer.config?.service?.name ||
			layer.id.replace(/^uploaded_(?:wms_)?/, "");
		const previewImg =
			layer.olLayer?.get("previewUrl") || "/preview-img/basemap-grau.png";

		return (
			<button
				onClick={() => handleLayerToggle(layer.id, layer.visibility)}
				className="relative h-12 w-12 cursor-pointer overflow-hidden rounded-sm transition-all"
			>
				<div className="flex h-full items-center justify-center">
					<Image
						src={previewImg}
						alt={displayName}
						loading="lazy"
						width={48}
						height={48}
						className="h-full w-full object-cover"
					/>
				</div>
				{layer.visibility && (
					<div className="border-accent pointer-events-none absolute inset-0 rounded-sm border-2" />
				)}
				<div className="absolute inset-x-0 bottom-0 truncate bg-black/40 px-1 py-0.5 text-[8px] text-white">
					{displayName}
				</div>
			</button>
		);
	};

	if (uploadedLayers.length === 0 && subjectLayers.length === 0) return null;

	return (
		<div
			ref={containerRef}
			className="pointer-events-none absolute left-[calc(100%+1rem)] flex items-end transition-opacity duration-300"
			style={{ opacity: isLayerTreeVisible ? 1 : 0 }}
		>
			{viewState === "extended" && (
				<div className="bg-background pointer-events-auto absolute bottom-0 left-0 mb-2 flex w-[260px] flex-col overflow-hidden rounded-sm">
					{/* Header */}
					<div className="border-muted flex h-8 w-full items-center justify-between border-b pl-2">
						<h3 className="text-sm font-semibold">Feature bearbeiten</h3>

						<div className="bg-secondary h-8 w-8 text-white">
							<button
								onClick={() => setViewState("open")}
								className="flex h-full w-full items-center justify-center"
							>
								<XCircleIcon />
							</button>
						</div>
					</div>

					<div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-2">
						{/* Sektion 1: Eigene Ebenen */}
						{uploadedLayers.length > 0 && (
							<div className="mb-6">
								<h3 className="mb-3">Eigene Ebenen</h3>
								<div className="grid grid-cols-3 gap-2">
									{uploadedLayers.map((layer) => (
										<LayerIconButton key={layer.id} layer={layer} />
									))}
								</div>
							</div>
						)}

						{/* Sektion 2: Fachdaten */}
						{subjectLayers.length > 0 && (
							<div>
								<h3 className="mb-3">Weitere Daten</h3>
								<div className="grid grid-cols-3 gap-2">
									{subjectLayers.map((layer) => (
										<LayerIconButton key={layer.id} layer={layer} />
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{viewState !== "extended" && (
				<div
					className="bg-background pointer-events-auto grid h-fit w-fit gap-1 rounded-sm p-1 shadow-sm"
					style={{
						gridTemplateColumns: `repeat(${Math.min(uploadedLayers.length + 1, 3)}, 48px)`,
					}}
				>
					{uploadedLayers.slice(0, 8).map((layer) => {
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
									<div className="border-accent pointer-events-none absolute inset-0 rounded-sm border-2" />
								)}
								<div className="absolute inset-x-0 bottom-0 truncate bg-black/40 px-1 py-0.5 text-[8px] text-white">
									{displayName}
								</div>
							</button>
						);
					})}

					{/* More Button */}
					<button
						className={`relative flex h-12 w-12 flex-col items-center justify-center rounded border border-dashed transition-all hover:bg-gray-100 ${viewState === "open" ? "border-primary" : "border-gray-300 bg-gray-50"}`}
						onClick={handleMoreButtonClick}
					>
						<StackIcon
							className={`h-5 w-5 ${viewState === "open" ? "text-primary" : "text-gray-400"}`}
							weight="duotone"
						/>
						<span className="text-[7px] font-bold text-gray-500 uppercase">
							Mehr
						</span>
					</button>
				</div>
			)}
		</div>
	);
};

export default LayerTree;
