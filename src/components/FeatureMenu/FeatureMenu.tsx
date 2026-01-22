"use client";

import { Button } from "@/components/ui/button";
import { performProjectBoundaryIntersection } from "@/lib/helpers/projectBoundary";
import { useMapStore } from "@/store/map";
import { LAYER_IDS } from "@/types/shared";
import { TrashIcon, XCircleIcon } from "@phosphor-icons/react";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source.js";
import { FC, useState } from "react";

interface FeatureMenuProps {
	layerId?: string;
	features?: any;
	onClose?: () => void;
}

const FeatureMenu: FC<FeatureMenuProps> = ({ layerId, features, onClose }) => {
	const map = useMapStore((state) => state.map);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!features || !map || !layerId || isDeleting) return;

		setIsDeleting(true);
		try {
			const layer = map
				.getAllLayers()
				.find((l) => l.get("id") === layerId) as VectorLayer<VectorSource>;

			if (layer && layer.getSource()) {
				const source = layer.getSource()!;
				source.removeFeature(features);
				source.changed();

				if (layerId === LAYER_IDS.PROJECT_BOUNDARY) {
					setTimeout(() => {
						performProjectBoundaryIntersection(map);
					}, 10);
				}
			}
		} catch (error) {
			console.error("Error deleting feature:", error);
		} finally {
			setIsDeleting(false);
			onClose?.();
		}
	};

	if (!features) return null;

	return (
		<div className="FeatureMenu-root bg-background w-[250px] shadow-lg">
			<div className="border-muted flex h-8 w-full items-center justify-between border-b pl-2">
				<h3 className="text-sm font-semibold">Feature bearbeiten</h3>
				<div className="bg-secondary h-8 w-8 text-white">
					<button
						className="flex h-full w-full items-center justify-center"
						onClick={onClose}
					>
						<XCircleIcon />
					</button>
				</div>
			</div>
			<div className="flex flex-col gap-2 p-2">
				<Button
					variant="outline"
					onClick={handleDelete}
					className="w-full"
					disabled={isDeleting}
				>
					<TrashIcon size={16} />
					{isDeleting ? "Wird gelöscht..." : "Feature löschen"}
				</Button>
			</div>
		</div>
	);
};

export default FeatureMenu;
