import BlockAreaSelector from "@/components/BlockAreaSelector/BlockAreaSelector";
import {
	DrawButton,
	DrawMeasureButton,
	DrawNoteButton,
	DrawProjectBoundaryButton,
} from "@/components/DrawControls";
import LayerConfigTest from "@/components/LayerConfigTest/LayerConfigTest";
import Map from "@/components/Map/Map";
import UploadProjectBoundaryButton from "@/components/UploadControls/UploadProjectBoundaryButton/UploadProjectBoundaryButton";

export default function Home() {
	return (
		<div className="relative flex h-full w-full flex-1 items-center justify-items-center">
			<div className="absolute right-40 bottom-4 z-47 flex gap-2">
				<DrawMeasureButton layerId="measures_seepage" />
				<DrawButton />
				<BlockAreaSelector />
				<DrawProjectBoundaryButton />
				<DrawNoteButton layerId="module1_notes" />
				<UploadProjectBoundaryButton />
			</div>

			<div className="absolute top-4 left-4 z-47">
				<LayerConfigTest />
			</div>

			<Map />
		</div>
	);
}
