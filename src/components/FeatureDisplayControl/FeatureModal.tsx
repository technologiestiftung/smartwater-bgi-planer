"use client";

import { getLayerById } from "@/lib/helpers/ol";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { SpinnerIcon, XCircleIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { FC, useState } from "react";
import { Button } from "../ui/button";

interface FeatureModalProps {
	attributes: Record<string, any> | null;
	layerId: string;
	coordinate?: [number, number];
	onClose: () => void;
}

const FeatureModal: FC<FeatureModalProps> = ({
	attributes,
	coordinate,
	onClose,
}) => {
	const map = useMapStore((state) => state.map);
	const drawLayerId = useLayersStore((state) => state.drawLayerId);
	const profilUrl = attributes?.["Profil"];
	const [isLoading, setIsLoading] = useState(!!profilUrl);

	if (!attributes) {
		return null;
	}

	return (
		<div className="FeatureModal-root fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
			<div className="bg-background flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-sm shadow-2xl">
				<div className="border-muted flex h-8 min-h-12 w-full items-center justify-between border-b pl-2">
					<h2 className="text-xl font-bold">Bohrprofil</h2>

					<div className="bg-secondary h-12 w-12 text-white">
						<button
							className="flex h-full w-full items-center justify-center"
							onClick={onClose}
						>
							<XCircleIcon />
						</button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-2">
					<div className="flex flex-col gap-4 lg:flex-row">
						{profilUrl && (
							<div className="relative flex w-full flex-col gap-2">
								<div className="rounded-md bg-white">
									{isLoading && (
										<div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
											<SpinnerIcon className="animate-spin" />
										</div>
									)}
									<Image
										src={profilUrl}
										alt="Bohrprofil"
										className="h-auto min-h-[300px] w-full object-contain"
										onLoad={() => setIsLoading(false)}
										onError={() => setIsLoading(false)}
										loading="lazy"
										width={300}
										height={100}
										unoptimized
									/>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="bg-muted/10 border-muted flex justify-end border-t p-4">
					<Button
						onClick={() => {
							if (map && drawLayerId && coordinate) {
								const layer = getLayerById(
									map,
									drawLayerId,
								) as VectorLayer<VectorSource> | null;
								if (layer && layer.getSource()) {
									const pointFeature = new Feature({
										geometry: new Point(coordinate),
										note: "Schlecht Versickerungsfähig",
										timestamp: new Date().toISOString(),
									});
									layer.getSource()?.addFeature(pointFeature);
									layer.getSource()?.changed();
								}
							}
							onClose();
						}}
					>
						Schlecht Versickerungsfähig
					</Button>
				</div>
			</div>
		</div>
	);
};

export default FeatureModal;
