import Map from "@/components/Map/Map";
import { MenuToggleButton } from "@/components/MenuToggleButton";

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
		<div className="relative h-full w-full">
			<Map />
			<MenuToggleButton projectId={id} />
			{children}
		</div>
	);
}
