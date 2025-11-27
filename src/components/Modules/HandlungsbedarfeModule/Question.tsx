"use client";

import ConfirmButton from "@/components/ConfirmButton/ConfirmButton";
import { Button } from "@/components/ui/button";
import { useLayerArea } from "@/hooks/use-layer-area";
import { useLayerFeatures } from "@/hooks/use-layer-features";
import { LayerConfigItem } from "@/store/layers/types";
import { LAYER_IDS } from "@/types/shared";
import { PlayIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { FC } from "react";

interface QuestionProps {
	questionConfig: LayerConfigItem;
	onAnswer: (answer: boolean) => void;
	onSkip: () => void;
	showButtons?: boolean;
}

const Question: FC<QuestionProps> = ({
	questionConfig,
	onAnswer,
	onSkip: _onSkip,
}) => {
	const { hasFeatures } = useLayerFeatures(questionConfig.drawLayerId);
	const { formattedArea } = useLayerArea(questionConfig.drawLayerId);
	const { hasFeatures: hasProjectBoundary } = useLayerFeatures(
		LAYER_IDS.PROJECT_BOUNDARY,
	);

	const handleConfirm = (): boolean => {
		const answer = hasFeatures;
		onAnswer(answer);
		return true;
	};

	return (
		<div className="flex h-full flex-col">
			<div className="mt-4 grow">
				{questionConfig && (
					<div>
						<h4 className="text-primary mb-2 text-lg font-semibold">
							{questionConfig.name}
						</h4>
						<div className="mb-4">
							<p className="mb-2 text-base font-medium">
								{questionConfig.question}
							</p>
							<p className="text-muted-foreground text-sm">
								{questionConfig.description}
							</p>
						</div>
					</div>
				)}

				<div className="pt-4">
					{questionConfig.id === "starter_question" ? (
						<>
							<Button onClick={handleConfirm} disabled={!hasProjectBoundary}>
								<PlayIcon />
								Checkfragen starten
							</Button>
							{/* {!hasProjectBoundary && (
								<div className="border-primary text-red mt-4 rounded-sm border border-dashed bg-red-50 p-2 text-sm">
									Bitte zeichnen Sie zuerst ein Projektgebiet ein, bevor Sie die
									Checkfragen starten.
								</div>
							)} */}
						</>
					) : (
						<ConfirmButton
							onConfirm={handleConfirm}
							displayText={formattedArea}
							autoAdvanceStep={false}
						/>
					)}
				</div>
			</div>

			{questionConfig.legendSrc && (
				<div className="mt-4">
					<h5 className="mb-2 text-sm font-medium">Legende:</h5>
					<Image
						src={questionConfig.legendSrc}
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

export default Question;
