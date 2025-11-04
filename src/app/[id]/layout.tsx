import { DrawControlsContainer } from "@/components/DrawControls";
import Map from "@/components/Map/Map";
import { MenuToggleButton } from "@/components/MenuToggleButton/MenuToggleButton";

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
		<div className="grid h-full w-full grid-cols-[34rem_1fr]">
			<div className="relative">{children}</div>
			<div className="relative">
				<Map />
				<DrawControlsContainer projectId={id} />
				<MenuToggleButton projectId={id} />
			</div>
		</div>
	);
}
