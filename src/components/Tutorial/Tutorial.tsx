"use client";

import { cn } from "@/lib/utils";
import { useUiStore } from "@/store";
import { selectActiveLayerConfig, useLayersStore } from "@/store/layers";
import Image from "next/image";
import { useEffect } from "react";

interface TutorialProps {
	type: "synthesis" | "controls" | "layerTree";
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
	const currentLayerConfig = useLayersStore(selectActiveLayerConfig);

	const renderContent = () => {
		if (type === "layerTree") {
			return (
				<>
					<p className="text-dark">
						Tippen Sie hier, um die aktuelle Hintegrundkarte zwischen{" "}
						<span className="font-bold">Digitale Orthophoto</span> und{" "}
						<span className="font-bold">basemap.de Vector</span> zu wechseln.
					</p>
					<p className="text-dark">
						Beim Hover können Sie die aktuelle inhaltliche{" "}
						<span className="font-bold">Layers</span> und{" "}
						<span className="font-bold">Zusatzkarten</span> steuern, inklusive
						Deckkraft anpassen und ein- und ausschalten.
					</p>
				</>
			);
		}
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
				type === "synthesis" && "translate-y-[6.5px] transform",
				type === "controls" && "mx-auto",
				type === "layerTree" && "ml-5",
			)}
		/>
	);

	useEffect(() => {
		if (type !== "controls") return;
		if (
			currentLayerConfig &&
			!showTutorialOnFirstQuestion &&
			(currentLayerConfig.canDrawNotes ||
				currentLayerConfig.canDrawPolygons ||
				currentLayerConfig.canDrawBTF)
		) {
			setTutorialOnFirstQuestionState(true);
			setTutorialState(true);
		}
	}, [
		type,
		currentLayerConfig,
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
					type === "synthesis" && "absolute bottom-7 left-24 flex",
					type === "controls" && "relative",
					type === "layerTree" && "absolute bottom-16 min-w-[300px]",
				)}
			>
				{type === "synthesis" && renderArrow()}
				<div className="border-accent rounded-xs border-4 bg-white">
					<div className="flex max-w-[395px] flex-col gap-2 p-4">
						{renderContent()}
					</div>
				</div>
				{(type === "controls" || type === "layerTree") && renderArrow()}
			</div>
		</>
	);
}
