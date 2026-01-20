"use client";

import ConfirmButton from "@/components/ConfirmButton/ConfirmButton";
import { RichTextWithLinks } from "@/components/RichTextWithLinks/RichTextWithLinks";
import { Button } from "@/components/ui/button";
import { useLayerArea } from "@/hooks/use-layer-area";
import { useLayerFeatures } from "@/hooks/use-layer-features";
import { LayerConfigItem } from "@/store/layers/types";
import { LAYER_IDS } from "@/types/shared";
import { PlayIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { FC } from "react";
import ScenarioDisplay from "../FeasibilityModule/ScenarioDisplay";

interface StepContentProps {
	layerConfig: LayerConfigItem;
	onAnswer: (answer: boolean) => void;
	onSkip: () => void;
	onShowPotentialMaps?: () => void;
}

const StepContent: FC<StepContentProps> = ({
	layerConfig,
	onAnswer,
	onSkip: _onSkip,
}) => {
	const { hasFeatures } = useLayerFeatures(layerConfig.drawLayerId);
	const { formattedArea } = useLayerArea(layerConfig.drawLayerId);
	const { hasFeatures: hasProjectBoundary } = useLayerFeatures(
		LAYER_IDS.PROJECT_BOUNDARY,
	);

	const handleConfirm = (): boolean => {
		const answer = hasFeatures;
		onAnswer(answer);
		return true;
	};

	// const handleNext = () => {
	// 	_onSkip();
	// };

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mt-4">
				{layerConfig && (
					<div>
						<h4 className="text-primary mb-2 text-lg font-semibold">
							{layerConfig.name}
						</h4>
						<div className="mb-4">
							<p className="mb-2 font-semibold">{layerConfig.question}</p>
							<div className="wrap-break-word">
								<RichTextWithLinks text={layerConfig.description} />
							</div>
						</div>
						{layerConfig.id === "2V1" && <ScenarioDisplay />}
					</div>
				)}

				<div className="pt-4">
					{(() => {
						if (layerConfig.id === "2V1") {
							return (
								<div className="flex w-full gap-2">
									{/* <Button onClick={handleNext}>Weiter</Button> */}
								</div>
							);
						} else if (
							layerConfig.id.includes("starter_question") ||
							layerConfig.isIntro
						) {
							return (
								<div className="flex w-full gap-2">
									<Button
										onClick={handleConfirm}
										disabled={!hasProjectBoundary}
									>
										<PlayIcon />
										{layerConfig.isIntro
											? `Modul ${layerConfig.moduleNumber} anfangen`
											: "Checkfragen starten"}
									</Button>
								</div>
							);
						}
						return (
							<ConfirmButton
								onConfirm={handleConfirm}
								displayText={formattedArea}
								autoAdvanceStep={false}
							/>
						);
					})()}
				</div>
			</div>

			{layerConfig.legendSrc && (
				<div className="mt-auto pt-6 pb-4">
					<h5 className="mb-2 text-sm font-medium">Legende:</h5>
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
};

export default StepContent;
