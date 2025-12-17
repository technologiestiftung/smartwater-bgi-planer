import { AddressSearch } from "@/components/AddressSearch/AddressSearch";
import { DrawControlsContainer } from "@/components/DrawControls";
import ConfigManager from "@/components/Map/ConfigManager/ConfigManager";
import LayerManager from "@/components/Map/LayerManager/LayerManager";
import Map from "@/components/Map/Map";
import { MenuToggleButton } from "@/components/MenuToggleButton/MenuToggleButton";
import ProjectGuard from "@/components/ProjectGuard/ProjectGuard";

interface ProjectLayoutProps {
	children: React.ReactNode;
	params: Promise<{
		id: string;
	}>;
}

export default async function ProjectLayout({
	children,
	params,
}: ProjectLayoutProps) {
	const { id } = await params;
	return (
		<ProjectGuard projectId={id}>
			<div className="grid h-full w-full grid-cols-[34rem_1fr]">
				<div className="relative">{children}</div>
				<div className="relative">
					<Map />
					<DrawControlsContainer projectId={id} />
					<MenuToggleButton projectId={id} />
					<AddressSearch />
				</div>
			</div>
			<LayerManager />
			<ConfigManager />
		</ProjectGuard>
	);
}
