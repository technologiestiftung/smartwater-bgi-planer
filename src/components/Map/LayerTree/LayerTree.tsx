"use client";

import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { selectActiveLayerConfig, useLayersStore } from "@/store/layers";
import { ManagedLayer } from "@/store/layers/types";
import { useUiStore } from "@/store/ui";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { FC, useMemo, useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import viewLayerConfig from "@/config/layerConfig.json";
import { usePathname } from "next/navigation";

const HIDDEN_LAYER_IDS = new Set([
	"rabimo_input_2025",
	"project_boundary",
	"project_btf_planning",
	"project_new_development",
]);

function getLayerDisplayName(layer: ManagedLayer): string {
	if (layer.id.startsWith("module_1_") || layer.id.startsWith("module_2_")) {
		const config = viewLayerConfig.find((c) => c.drawLayerId === layer.id);
		if (config?.name) {
			return config.name;
		}
	}
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
							className={`focus-visible:ring-ring relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-sm transition-all focus-visible:ring-2 focus-visible:outline-none ${
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

function filterLayersAfterSearch(
	arr: ManagedLayer[],
	search: string,
): ManagedLayer[] {
	if (!search.trim()) return arr;
	return arr.filter((l) =>
		getLayerDisplayName(l).toLowerCase().includes(search.toLowerCase()),
	);
}
function filterLayersAfterModule(
	arr: ManagedLayer[],
	moduleId: string,
): ManagedLayer[] {
	if (!moduleId.trim()) return arr;
	return arr.filter((l) => l.id.startsWith(moduleId));
}
function filterOutModuleLayers(arr: ManagedLayer[]): ManagedLayer[] {
	return arr.filter((l) => !l.id.startsWith("module_"));
}

// eslint-disable-next-line complexity
export const LayerTree: FC = () => {
	const { layers, setLayerVisibility, setLayerOpacity, activeLayerConfig } =
		useLayersStore(
			useShallow((state) => ({
				layers: state.layers,
				setLayerVisibility: state.setLayerVisibility,
				setLayerOpacity: state.setLayerOpacity,
				activeLayerConfig: selectActiveLayerConfig(state),
			})),
		);
	const isLayerTreeVisible = useUiStore((state) => state.isLayerTreeVisible);
	const isAddMeasureActive = useUiStore((state) => state.isAddMeasureActive);
	const [search, setSearch] = useState("");
	const [activeLayersInModule3, setActiveLayersInModule3] = useState<string[]>(
		[],
	);

	const allLayers = useMemo(() => Array.from(layers.values()), [layers]);

	const uploadedLayers = useMemo(
		() =>
			allLayers.filter(
				(l) => l.id.startsWith("uploaded_") || l.id.startsWith("uploaded_wms_"),
			),
		[allLayers],
	);

	const currentVisibleLayerIds = useMemo(() => {
		if (!activeLayerConfig) return null;
		return new Set(activeLayerConfig.visibleLayerIds);
	}, [activeLayerConfig]);

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

	const pathname = usePathname();
	const isPlanningModule = pathname?.endsWith("/planung");

	const filteredUploaded = filterLayersAfterSearch(uploadedLayers, search);
	const filteredSubject = filterLayersAfterSearch(subjectLayers, search);
	const noResults =
		filteredUploaded.length === 0 && filteredSubject.length === 0;

	const renderPlanningModuleLayerSections = () => {
		const contentMaps = filterOutModuleLayers(filteredSubject);
		const module1Maps = filterLayersAfterModule(filteredSubject, "module_1_");
		const module2Maps = filterLayersAfterModule(filteredSubject, "module_2_");
		const module3Maps = filterLayersAfterModule(filteredSubject, "module_3_");
		const content: React.ReactNode[] = [];
		const setLayerVisibilityInModule3 = (id: string, v: boolean) => {
			if (activeLayersInModule3.includes(id)) {
				setActiveLayersInModule3((prev) => prev.filter((f) => f !== id));
			} else {
				setActiveLayersInModule3((prev) => [...prev, id]);
			}
			setLayerVisibility(id, v);
		};
		if (contentMaps.length > 0)
			content.push(
				<LayerSection
					key="contentMaps"
					title="Inhaltskarten"
					layers={contentMaps}
					onToggle={(id, v) => setLayerVisibilityInModule3(id, !v)}
					onOpacity={setLayerOpacity}
				/>,
			);
		if (module1Maps.length > 0)
			content.push(
				<LayerSection
					key="module1Maps"
					title="Modul 1: Handlungsbedarfe"
					layers={module1Maps}
					onToggle={(id, v) => setLayerVisibilityInModule3(id, !v)}
					onOpacity={setLayerOpacity}
				/>,
			);
		if (module2Maps.length > 0)
			content.push(
				<LayerSection
					key="module2Maps"
					title="Modul 2: Machbarkeiten"
					layers={module2Maps}
					onToggle={(id, v) => setLayerVisibilityInModule3(id, !v)}
					onOpacity={setLayerOpacity}
				/>,
			);
		if (module3Maps.length > 0)
			content.push(
				<LayerSection
					key="module3Maps"
					title="Modul 3: Maßnahmen"
					layers={module3Maps}
					onToggle={(id, v) => setLayerVisibilityInModule3(id, !v)}
					onOpacity={setLayerOpacity}
				/>,
			);

		return content;
	};

	useEffect(() => {
		if (!isPlanningModule) return;
		allLayers.forEach((layer) => {
			if (
				layer.id.startsWith("module_") &&
				!activeLayersInModule3.includes(layer.id)
			) {
				setLayerVisibility(layer.id, false);
			}
		});
	}, [isPlanningModule, isAddMeasureActive]);

	if (uploadedLayers.length === 0 && subjectLayers.length === 0) return null;

	return (
		<div
			className="absolute left-[calc(100%+1rem)] z-30 flex items-end transition-opacity duration-300"
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

				<div className="max-h-80 overflow-y-auto">
					<div className="flex flex-col gap-4 p-3">
						{filteredSubject.length > 0 && !isPlanningModule && (
							<LayerSection
								title="Inhaltskarten"
								layers={filteredSubject}
								onToggle={(id, v) => setLayerVisibility(id, !v)}
								onOpacity={setLayerOpacity}
							/>
						)}
						{isPlanningModule && renderPlanningModuleLayerSections()}
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
				</div>
			</div>
		</div>
	);
};
