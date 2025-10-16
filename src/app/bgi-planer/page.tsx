import BlockAreaSelector from "@/components/BlockAreaSelector/BlockAreaSelector";
import {
	DrawButton,
	DrawMeasureButton,
	DrawProjectBoundaryButton,
} from "@/components/DrawControls";
import LayerConfigTest from "@/components/LayerConfigTest/LayerConfigTest";
import Map from "@/components/Map/Map";

export default function Home() {
	return (
		<div className="items-center flex-1 justify-items-center h-full relative w-full flex">
			<div className="absolute bottom-4 right-40 z-50 flex gap-2">
				<DrawMeasureButton layerId="measures_seepage" />
				<DrawButton layerId="project_boundary" />
				<BlockAreaSelector />
				<DrawProjectBoundaryButton />
			</div>

			<div className="absolute top-4 left-4 z-50">
				<LayerConfigTest />
			</div>

			<Map />
		</div>
	);
}
