import BlockAreaSelector from "@/components/BlockAreaSelector/BlockAreaSelector";
import {
	DrawButton,
	DrawMeasureButton,
	DrawNoteButton,
	DrawProjectBoundaryButton,
} from "@/components/DrawControls";
import Map from "@/components/Map/Map";
import { MenuToggleButton } from "@/components/MenuToggleButton/MenuToggleButton";
import UploadProjectBoundaryButton from "@/components/UploadProjectBoundaryButton/UploadProjectBoundaryButton";

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
			<div className="absolute right-40 bottom-4 z-1000 flex gap-2">
				<DrawMeasureButton layerId="measures_seepage" />
				<DrawButton />
				<BlockAreaSelector />
				<DrawProjectBoundaryButton />
				<DrawNoteButton layerId="module1_notes" />
				<UploadProjectBoundaryButton />
			</div>
			<MenuToggleButton projectId={id} />
			{children}
		</div>
	);
}
