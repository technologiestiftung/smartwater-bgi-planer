"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLayersStore } from "@/store/layers";
import { ManagedLayer } from "@/store/layers/types";
import { useUiStore } from "@/store/ui";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

const HIDDEN_LAYER_IDS = new Set([
	"rabimo_input_2025",
	"project_boundary",
	"project_btf_planning",
	"project_new_development",
]);

function getLayerDisplayName(layer: ManagedLayer): string {
	return (
		layer.config?.name ||
		layer.config?.service?.name ||
		layer.id.replace(/^uploaded_(?:wms_)?/, "")
	);
}

interface LayerCardProps {
	layer: ManagedLayer;
	onToggle: (id: string, visible: boolean) => void;
	onOpacity: (id: string, value: number) => void;
}

const LayerCard: FC<LayerCardProps> = ({ layer, onToggle, onOpacity }) => {
	const name = getLayerDisplayName(layer);
	const sourceUrl = layer.config.service?.sourceUrl;

	return (
		<div className="box-border flex min-h-12 w-full gap-2">
			<div className="flex h-full flex-1 flex-col">
				{sourceUrl ? (
					<a
						href={sourceUrl}
						target="_blank"
						rel="noopener noreferrer"
						className={`line-clamp-2 text-sm hover:underline ${
							layer.visibility ? "text-primary" : "text-muted-foreground"
						}`}
					>
						{name}
					</a>
				) : (
					<p
						className={`line-clamp-2 text-sm ${
							layer.visibility ? "text-primary" : "text-muted-foreground"
						}`}
					>
						{name}
					</p>
				)}
				<Slider
					min={0}
					max={1}
					step={0.01}
					value={[layer.opacity]}
					onValueChange={([v]) => onOpacity(layer.id, v)}
					disabled={!layer.visibility}
					className="min-h-6 w-full"
				/>
			</div>
			<div className="flex shrink-0 items-center">
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							onClick={() => onToggle(layer.id, layer.visibility)}
							className={`focus-visible:ring-ring relative flex h-12 w-12 items-center justify-center rounded-sm transition-all focus-visible:ring-2 focus-visible:outline-none ${
								layer.visibility
									? "bg-primary text-white"
									: "border border-gray-200 bg-gray-50 text-gray-400"
							}`}
							aria-label={`${layer.visibility ? "Hide" : "Show"} ${name} layer`}
						>
							{layer.visibility ? (
								<EyeIcon className="h-5 w-5" weight="bold" />
							) : (
								<EyeSlashIcon className="h-5 w-5" weight="bold" />
							)}
						</button>
					</TooltipTrigger>
					<TooltipContent side="top">{name}</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
};

interface LayerSectionProps {
	title?: string;
	layers: ManagedLayer[];
	onToggle: (id: string, visible: boolean) => void;
	onOpacity: (id: string, value: number) => void;
}

const LayerSection: FC<LayerSectionProps> = ({
	title,
	layers,
	onToggle,
	onOpacity,
}) => (
	<div className="space-y-3">
		{title && (
			<p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
				{title}
			</p>
		)}
		<div className="flex flex-col gap-2">
			{layers.map((layer) => (
				<LayerCard
					key={layer.id}
					layer={layer}
					onToggle={onToggle}
					onOpacity={onOpacity}
				/>
			))}
		</div>
	</div>
);

function filterLayers(arr: ManagedLayer[], search: string): ManagedLayer[] {
	if (!search.trim()) return arr;
	return arr.filter((l) =>
		getLayerDisplayName(l).toLowerCase().includes(search.toLowerCase()),
	);
}

// eslint-disable-next-line complexity
const LayerTree: FC = () => {
	const {
		layers,
		setLayerVisibility,
		setLayerOpacity,
		layerConfig,
		layerConfigId,
	} = useLayersStore(
		useShallow((state) => ({
			layers: state.layers,
			setLayerVisibility: state.setLayerVisibility,
			setLayerOpacity: state.setLayerOpacity,
			layerConfig: state.layerConfig,
			layerConfigId: state.layerConfigId,
		})),
	);
	const isLayerTreeVisible = useUiStore((state) => state.isLayerTreeVisible);
	const [search, setSearch] = useState("");

	const allLayers = useMemo(() => Array.from(layers.values()), [layers]);

	const uploadedLayers = useMemo(
		() =>
			allLayers.filter(
				(l) => l.id.startsWith("uploaded_") || l.id.startsWith("uploaded_wms_"),
			),
		[allLayers],
	);

	const currentVisibleLayerIds = useMemo(() => {
		if (!layerConfigId) return null;
		const item = layerConfig.find((c) => c.id === layerConfigId);
		return item ? new Set(item.visibleLayerIds) : null;
	}, [layerConfig, layerConfigId]);

	const subjectLayers = useMemo(
		() =>
			allLayers.filter(
				(l) =>
					l.layerType === "subject" &&
					!l.id.startsWith("uploaded_") &&
					!HIDDEN_LAYER_IDS.has(l.id) &&
					(currentVisibleLayerIds === null || currentVisibleLayerIds.has(l.id)),
			),
		[allLayers, currentVisibleLayerIds],
	);

	if (uploadedLayers.length === 0 && subjectLayers.length === 0) return null;

	const filteredUploaded = filterLayers(uploadedLayers, search);
	const filteredSubject = filterLayers(subjectLayers, search);
	const noResults =
		filteredUploaded.length === 0 && filteredSubject.length === 0;

	return (
		<div
			className="absolute left-[calc(100%+1rem)] z-50 flex items-end transition-opacity duration-300"
			style={{
				opacity: isLayerTreeVisible ? 1 : 0,
				pointerEvents: isLayerTreeVisible ? "auto" : "none",
			}}
		>
			<div className="bg-background flex w-80 flex-col overflow-hidden rounded-sm shadow-md">
				<div className="px-3 py-2">
					<input
						type="text"
						placeholder="Karte suchen"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="bg-neutral-mid text-foreground placeholder:text-muted-foreground w-full rounded-sm px-2 py-1 text-xs outline-none"
					/>
				</div>

				<ScrollArea type="scroll" viewportClassName="max-h-[21rem] !h-auto">
					<div className="flex flex-col gap-4 p-3">
						{filteredSubject.length > 0 && (
							<LayerSection
								title="Inhaltskarten"
								layers={filteredSubject}
								onToggle={(id, v) => setLayerVisibility(id, !v)}
								onOpacity={setLayerOpacity}
							/>
						)}
						{filteredUploaded.length > 0 && filteredSubject.length > 0 && (
							<Separator />
						)}
						{filteredUploaded.length > 0 && (
							<LayerSection
								title="Zusatzkarten"
								layers={filteredUploaded}
								onToggle={(id, v) => setLayerVisibility(id, !v)}
								onOpacity={setLayerOpacity}
							/>
						)}
						{noResults && (
							<p className="text-muted-foreground py-4 text-center text-xs">
								Keine Ebenen gefunden
							</p>
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default LayerTree;
