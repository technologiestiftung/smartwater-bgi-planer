"use client";

import ConfirmButton from "@/components/ConfirmButton/ConfirmButton";
import { useLayerArea } from "@/hooks/use-layer-area";
import { useLayerFeatures } from "@/hooks/use-layer-features";
import { useLayersStore } from "@/store/layers";
import { LayerConfigItem } from "@/store/layers/types";
import Image from "next/image";
import { FC, useEffect } from "react";

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
	showButtons = true,
}) => {
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);
	const { hasFeatures } = useLayerFeatures(questionConfig.drawLayerId);
	const { formattedArea } = useLayerArea(questionConfig.drawLayerId);

	useEffect(() => {
		if (!questionConfig.id) return;

		applyConfigLayers(questionConfig.id);
	}, [questionConfig, applyConfigLayers]);

	useEffect(() => {
		if (questionConfig.id) {
			applyConfigLayers(questionConfig.id);
		}
	}, []);

	const handleConfirm = (): boolean => {
		const answer = hasFeatures;
		onAnswer(answer);
		return true;
	};

	return (
		<div className="flex h-full flex-col">
			<div className="grow space-y-4">
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

				{showButtons && (
					<div className="pt-4">
						<ConfirmButton
							onConfirm={handleConfirm}
							validate={() => hasFeatures}
							displayText={formattedArea}
							autoAdvanceStep={false}
						/>
					</div>
				)}
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
