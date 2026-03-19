"use client";

import { cn } from "@/lib/utils";
import { useLayersStore, useUiStore } from "@/store";
import Image from "next/image";
import { useEffect, useMemo } from "react";

interface TutorialProps {
	type: "synthesis" | "controls";
}

export function Tutorial({ type }: TutorialProps) {
	const showTutorial = useUiStore((state) => state.showTutorial);
	const setTutorialState = useUiStore((state) => state.setTutorialState);
	const showTutorialOnFirstQuestion = useUiStore(
		(state) => state.showTutorialOnFirstQuestion,
	);
	const setTutorialOnFirstQuestionState = useUiStore(
		(state) => state.setTutorialOnFirstQuestionState,
	);
	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const currentQuestionConfig = useMemo(
		() => layerConfig.find((config) => config.id === layerConfigId),
		[layerConfig, layerConfigId],
	);

	const renderContent = () => {
		if (type === "controls") {
			return (
				<>
					<p className="text-dark">
						Verwenden Sie die Zeichentools um Ihre Auswahl zu treffen.
					</p>
					<p className="text-dark">
						<span className="font-bold">Zeichnen</span> gibt Ihnen die
						Möglichkeit ein frei setzbares Polygon einzuzeichnen.
					</p>
					<p className="text-dark text-sm font-light italic">
						Wenn Sie ein Polygon schließen möchten, klicken Sie entweder den
						Anfangspunkt erneut oder führen einen Doppelklick durch.
					</p>
					<p className="text-dark">
						<span className="font-bold">Blockteilflächen selektieren</span>{" "}
						markiert die offiziellen Blockteilflächen nach ISO-5.
					</p>
					<p className="text-dark text-sm font-light italic">
						Bereits ausgewählte Blockteilflächen können Sie bei Bedarf durch
						einen weiteren Klick auch wieder abwählen.
					</p>
				</>
			);
		}
		return (
			<p className="text-dark">
				Die <span className="font-bold">Synthese</span> zeigt eine
				Zusammenfassung der von Ihnen eingezeichneten Inhalte.
			</p>
		);
	};

	const renderArrow = () => (
		<Image
			src={
				type === "synthesis"
					? "/icons/arrow-tutorial-rotated.svg"
					: "/icons/arrow-tutorial.svg"
			}
			loading="lazy"
			alt="Tutorial-Hinweis"
			width={type === "synthesis" ? 32 : 16}
			height={type === "synthesis" ? 32 : 16}
			className={cn(
				"relative shrink-0 self-end object-contain",
				type === "synthesis" ? "translate-y-[6.5px] transform" : "mx-auto",
			)}
		/>
	);

	useEffect(() => {
		if (
			currentQuestionConfig &&
			!showTutorialOnFirstQuestion &&
			(currentQuestionConfig.canDrawNotes ||
				currentQuestionConfig.canDrawPolygons ||
				currentQuestionConfig.canDrawBTF)
		) {
			setTutorialOnFirstQuestionState(true);
			setTutorialState(true);
		}
	}, [
		currentQuestionConfig,
		setTutorialState,
		showTutorialOnFirstQuestion,
		setTutorialOnFirstQuestionState,
	]);

	if (!showTutorial) return null;

	return (
		<>
			{type === "synthesis" && (
				<div
					className="fixed inset-0 bg-black/58"
					onClick={() => setTutorialState(false)}
				/>
			)}
			<div
				className={cn(
					type === "synthesis" ? "absolute bottom-7 left-24 flex" : "relative",
				)}
			>
				{type === "synthesis" && renderArrow()}
				<div className="border-accent rounded-xs border-4 bg-white">
					<div className="flex max-w-[395px] flex-col gap-2 p-4">
						{renderContent()}
					</div>
				</div>
				{type === "controls" && renderArrow()}
			</div>
		</>
	);
}
