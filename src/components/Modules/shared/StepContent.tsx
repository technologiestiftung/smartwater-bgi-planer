"use client";

import { ConfirmButton } from "@/components/ConfirmButton/ConfirmButton";
import { RichTextWithLinks } from "@/components/RichTextWithLinks/RichTextWithLinks";
import { Button } from "@/components/ui/button";
import { useDeselectAllFeatures } from "@/hooks/useDeselectAllFeatures";
import { useLayerArea } from "@/hooks/useLayerArea";
import { useLayerFeatures } from "@/hooks/useLayerFeatures";
import { useSelectProjectBoundary } from "@/hooks/useSelectProjectBoundary";
import { LayerConfigItem } from "@/store/layers/types";
import { LAYER_IDS } from "@/types/shared";
import {
	PlayIcon,
	SelectionAllIcon,
	SelectionSlashIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { FC } from "react";
import { ScenarioDisplay } from "../FeasibilityModule/ScenarioDisplay";

interface StepContentProps {
	layerConfig: LayerConfigItem;
	onAnswer: (answer: boolean) => void;
	onSkip: () => void;
	onShowPotentialMaps?: () => void;
}

export const StepContent: FC<StepContentProps> = ({
	layerConfig,
	onAnswer,
	onSkip: _onSkip,
}) => {
	const { hasFeatures } = useLayerFeatures(layerConfig.drawLayerId);
	const { formattedArea, area } = useLayerArea(layerConfig.drawLayerId);
	const { clearDrawLayerFeatures } = useDeselectAllFeatures();
	const { selectProjectBoundary } = useSelectProjectBoundary();
	const { hasFeatures: hasProjectBoundary } = useLayerFeatures(
		LAYER_IDS.PROJECT_BOUNDARY,
	);

	const handleConfirm = (): boolean => {
		const answer = hasFeatures;
		onAnswer(answer);
		return true;
	};

	const handleNotApplicable = (): boolean => {
		if (area > 0) {
			clearDrawLayerFeatures();
			setTimeout(() => {
				onAnswer(false);
			}, 500);
		} else {
			onAnswer(false);
		}
		return true;
	};

	const handleAllApplicable = (): boolean => {
		selectProjectBoundary();
		setTimeout(() => {
			onAnswer(true);
		}, 500);
		return true;
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mt-4">
				{layerConfig && (
					<div>
						{layerConfig.name && (
							<h4 className="text-primary mb-2 text-lg font-semibold">
								{layerConfig.name}
							</h4>
						)}
						<div>{layerConfig.id === "2V1" && <ScenarioDisplay />}</div>
						<div className="mb-4">
							<p className="mb-2 font-semibold">{layerConfig.question}</p>
							<div className="wrap-break-word">
								<RichTextWithLinks text={layerConfig.description} />
							</div>
						</div>
					</div>
				)}

				<div className="pt-4">
					{(() => {
						if (
							layerConfig.id === "2V1" ||
							layerConfig.id === "2G1" ||
							layerConfig.id === "2E1"
						) {
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
							<div className="flex flex-wrap gap-3">
								<Button onClick={handleNotApplicable}>
									<SelectionSlashIcon />
									Nicht zutreffend
								</Button>
								<Button onClick={handleAllApplicable}>
									<SelectionAllIcon />
									Überall zutreffend
								</Button>
								<ConfirmButton
									onConfirm={handleConfirm}
									displayText={formattedArea}
									autoAdvanceStep={false}
									buttonText="Auswahl bestätigen"
									disabled={area === 0}
								/>
							</div>
						);
					})()}
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
};
