"use client";

import { RichTextWithLinks } from "@/components/RichTextWithLinks/RichTextWithLinks";
import { LayerConfigItem } from "@/store/layers/types";
import Image from "next/image";

interface MeasurePlaningStepContentProps {
	layerConfig: LayerConfigItem;
}

export function MeasurePlaningStepContent({
	layerConfig,
}: MeasurePlaningStepContentProps) {
	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mt-4">
				<div className="mb-4">
					{layerConfig.question && (
						<p className="mb-2 font-semibold">{layerConfig.question}</p>
					)}
					{layerConfig.description && (
						<div className="wrap-break-word">
							<RichTextWithLinks text={layerConfig.description} />
						</div>
					)}
				</div>
			</div>

			{layerConfig.legendSrc && (
				<div className="mt-auto pt-6 pb-4">
					<h5 className="mb-2 text-sm font-medium">
						{layerConfig.legendTitle || "Legende"}
					</h5>
					<Image
						src={layerConfig.legendSrc}
						alt="Legende für die Karte"
						width={400}
						height={200}
						className="h-auto max-w-full rounded border"
					/>
				</div>
			)}
		</div>
	);
}
