"use client";

import { cn } from "@/lib/utils";
import { selectActiveLayerConfig, useLayersStore } from "@/store/layers";
import { useTutorialStore } from "@/store/tutorial";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface TutorialProps {
	type: "synthesis" | "controls" | "layerTree";
	isAddMeasure?: boolean;
}

export function Tutorial({ type, isAddMeasure }: TutorialProps) {
	const showTutorialOnFirstQuestion = useTutorialStore(
		(state) => state.showTutorialOnFirstQuestion,
	);
	const setTutorialOnFirstQuestion = useTutorialStore(
		(state) => state.setTutorialOnFirstQuestion,
	);
	const showTutorialOnFirstMeasureDraw = useTutorialStore(
		(state) => state.showTutorialOnFirstMeasureDraw,
	);
	const setTutorialOnFirstMeasureDraw = useTutorialStore(
		(state) => state.setTutorialOnFirstMeasureDraw,
	);
	const showTutorial =
		showTutorialOnFirstQuestion || showTutorialOnFirstMeasureDraw;
	const pathname = usePathname();
	const isPlanningModule = pathname.endsWith("/planung");

	const currentLayerConfig = useLayersStore(selectActiveLayerConfig);

	const renderContent = () => {
		if (type === "layerTree") {
			if (isPlanningModule) {
				return (
					<p className="text-dark">
						Im <span className="font-bold">Layer Tree</span> können Sie auf Ihr
						Inhalt aus Module 1 und 2 jederzeit zugreifen bzw. ein- und
						ausschalten.
					</p>
				);
			}
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
			if (isPlanningModule) {
				return (
					<>
						<p className="text-dark">
							Verwenden Sie die Zeichentools um Ihre Maßnahmen zu platzieren.
						</p>
						<p className="text-dark">
							Bei <span className="font-bold">Versickerungsmaßnahmen</span>{" "}
							erfolgt der Prozess zweistufig: Erstmal müssen Sie angeschlossene
							Flächen zeichnen - das heißt, von welche versiegelten Fläche oder
							Dächern das Wasser abgeleitet werden soll. Dann wählen Sie die
							angeschlossene Fläche aus und zeichnen Sie die Maßnahme, die daran
							angeschlossen werden soll.
						</p>
					</>
				);
			}
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
		if (isPlanningModule) {
			return (
				<p className="text-dark">
					Die <span className="font-bold">Effektbewertung</span> erlaubt Ihnen,
					die simulierte Effekte Ihrer bisherige Planung hinsichtlich
					Wasserhaushalt und Gewässerbelastung zu entdecken.
				</p>
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
		if (type !== "synthesis") return;
		if (
			currentLayerConfig &&
			(currentLayerConfig.canDrawNotes ||
				currentLayerConfig.canDrawPolygons ||
				currentLayerConfig.canDrawBTF)
		) {
			if (showTutorialOnFirstQuestion === null) {
				setTutorialOnFirstQuestion(true);
			}
		} else if (
			isPlanningModule &&
			isAddMeasure &&
			showTutorialOnFirstMeasureDraw === null
		) {
			setTutorialOnFirstMeasureDraw(true);
		}
	}, [
		type,
		currentLayerConfig,
		isPlanningModule,
		isAddMeasure,
		setTutorialOnFirstMeasureDraw,
		setTutorialOnFirstQuestion,
	]);

	if (!showTutorial) return null;

	return (
		<>
			{type === "synthesis" && (
				<div
					className="fixed inset-0 bg-black/58"
					onClick={() => {
						if (isPlanningModule) {
							setTutorialOnFirstMeasureDraw(false);
						} else {
							setTutorialOnFirstQuestion(false);
						}
					}}
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
