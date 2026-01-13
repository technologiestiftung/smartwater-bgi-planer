"use client";

import ConfirmButton from "@/components/ConfirmButton/ConfirmButton";
import { TextWithLinks } from "@/components/TextWithLinks/TextWithLinks";
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
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mt-4">
				{questionConfig && (
					<div>
						<h4 className="text-primary mb-2 text-lg font-semibold">
							{questionConfig.name}
						</h4>
						<div className="mb-4">
							<p className="mb-2 font-semibold">{questionConfig.question}</p>
							<div className="wrap-break-word">
								<TextWithLinks text={questionConfig.description} />
							</div>
						</div>
					</div>
				)}

				<div className="pt-4">
					{questionConfig.id.includes("starter_question") ||
					questionConfig.isIntro ? (
						<>
							<Button onClick={handleConfirm} disabled={!hasProjectBoundary}>
								<PlayIcon />
								{questionConfig.isIntro
									? `Modul ${questionConfig.moduleNumber} anfangen`
									: "Checkfragen starten"}
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
				<div className="mt-auto pt-6 pb-4">
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
