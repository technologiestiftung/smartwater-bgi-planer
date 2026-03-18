"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useLayersStore, useProjectsStore, useUiStore } from "@/store";
import { XCircleIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface TutorialProps {
	type: "synthesis" | "controls";
	onVisibilityChange?: (visible: boolean) => void;
	test?: boolean;
}

export function Tutorial({ type, onVisibilityChange, test }: TutorialProps) {
	const pathname = usePathname();
	const {
		currentStepId,
		hideControlsTutorial,
		hideSynthesisTutorial,
		setTutorialState,
	} = useUiStore();
	const { getProject } = useProjectsStore();
	const project = getProject();
	const hideTutorials = project?.hideTutorials ?? false;
	const [show, setShow] = useState(true);
	const takeUIStore =
		type === "controls" ? hideControlsTutorial : hideSynthesisTutorial;
	const [hideOnNext, setHideOnNext] = useState(takeUIStore ?? false);
	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const currentQuestionConfig = layerConfig.find(
		(config) => config.id === layerConfigId,
	);
	const isProjectStarter = pathname.includes("/project-starter");
	const showTutorial =
		!hideTutorials &&
		!currentQuestionConfig?.id?.includes("starter_question") &&
		!currentQuestionConfig?.isIntro &&
		!currentQuestionConfig?.id?.startsWith("start_view") &&
		!isProjectStarter &&
		!takeUIStore &&
		show;

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
				Zusammenfassung der von Ihnen eingezeichneten Inhalte
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
				type === "synthesis"
					? "z-[52] translate-y-[6.5px] transform"
					: "mx-auto",
			)}
		/>
	);

	useEffect(() => {
		// setShow(true);
		if (hideOnNext) {
			if (type === "controls") {
				setTutorialState(true, hideSynthesisTutorial ?? false);
			} else {
				setTutorialState(hideControlsTutorial ?? false, true);
			}
		}
	}, [currentStepId, layerConfigId]);

	useEffect(() => {
		onVisibilityChange?.(showTutorial);
	}, [showTutorial, onVisibilityChange]);

	if (!showTutorial && !test) return null;

	return (
		<>
			<div
				className={cn(
					"fixed inset-0 bg-black/58",
					type === "synthesis" ? "z-[100]" : "z-40",
				)}
				onClick={() => setShow(false)}
			/>
			<div
				className={cn(
					type === "synthesis"
						? "absolute bottom-7 left-24 z-[101] flex"
						: "relative z-[101]",
				)}
			>
				{type === "synthesis" && renderArrow()}
				<div className="bg-white">
					<div className="border-muted relative flex h-10 shrink-0 items-center border-b px-6">
						<div
							className="bg-secondary absolute top-0 right-0 flex size-10 cursor-pointer items-center justify-center"
							onClick={() => setShow(false)}
						>
							<XCircleIcon className="size-5 text-white" />
						</div>
					</div>
					<div className="mt-4 flex max-w-[395px] flex-col gap-2 p-4">
						{renderContent()}
						<div className="mt-2 flex w-full items-center gap-3">
							<Checkbox
								id="hide-tutorial"
								checked={hideOnNext}
								onCheckedChange={(checked: boolean) => setHideOnNext(checked)}
							/>
							<label
								htmlFor="hide-tutorial"
								className="text-dark cursor-pointer text-sm font-light italic select-none"
							>
								Hinweis nicht mehr anzeigen
							</label>
						</div>
					</div>
				</div>
				{type === "controls" && renderArrow()}
			</div>
		</>
	);
}
