"use client";

import { Button } from "@/components/ui/button";
import SWLogo from "@/logos/SWLogo.svg";
import { useProjectStore } from "@/store";
import { useTutorialStore } from "@/store/tutorial";
import { selectActiveLayerConfig, useLayersStore } from "@/store/layers";
import { InfoIcon, ListIcon } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";

interface MenuToggleButtonProps {
	projectId: string;
}

// eslint-disable-next-line complexity
export function MenuToggleButton({ projectId }: MenuToggleButtonProps) {
	const router = useRouter();
	const pathname = usePathname();
	const setLastPath = useProjectStore((state) => state.setLastPath);
	const isPlanningModule = pathname?.endsWith("/planung");

	const showTutorialOnFirstQuestion = useTutorialStore(
		(state) => state.showTutorialOnFirstQuestion,
	);
	const showTutorialOnFirstMeasureDraw = useTutorialStore(
		(state) => state.showTutorialOnFirstMeasureDraw,
	);
	const showTutorial =
		showTutorialOnFirstQuestion || showTutorialOnFirstMeasureDraw;
	const setTutorialOnFirstQuestion = useTutorialStore(
		(state) => state.setTutorialOnFirstQuestion,
	);
	const setTutorialOnFirstMeasureDraw = useTutorialStore(
		(state) => state.setTutorialOnFirstMeasureDraw,
	);

	const currentLayerConfig = useLayersStore(selectActiveLayerConfig);
	const isModule =
		pathname.endsWith("/handlungsbedarfe") || pathname.endsWith("/machbarkeit");

	const handleToggle = () => {
		if (pathname.endsWith("/menu")) {
			router.back();
		} else {
			setLastPath(pathname);
			router.push(`/${projectId}/menu`);
		}
	};

	return (
		<div className="fixed top-4 right-4 z-40 flex items-center gap-3">
			{((isModule &&
				(currentLayerConfig?.canDrawNotes ||
					currentLayerConfig?.canDrawPolygons ||
					currentLayerConfig?.canDrawBTF)) ||
				isPlanningModule) && (
				<div className="relative inline-flex">
					{showTutorial && (
						<span className="bg-accent/80 absolute inset-0 animate-ping rounded-full [animation-duration:1s] [animation-fill-mode:forwards] [animation-iteration-count:3]" />
					)}
					<button
						type="button"
						className="bg-accent flex size-8 cursor-pointer items-center justify-center rounded-full"
						onClick={() => {
							if (isPlanningModule) {
								setTutorialOnFirstMeasureDraw(true);
							} else {
								setTutorialOnFirstQuestion(true);
							}
						}}
						aria-label={showTutorial ? "Hide tutorial" : "Show tutorial"}
					>
						<InfoIcon
							className="text-neutral-dark size-6 cursor-pointer"
							aria-hidden="true"
						/>
					</button>
				</div>
			)}
			<div className="relative">
				<Button
					onClick={handleToggle}
					size="lg"
					variant="ghost"
					className="bg-background flex h-16 w-56 gap-4 p-2 shadow-lg"
					aria-label="Toggle menu"
				>
					<SWLogo className="size-36" />
					<ListIcon className="text-primary size-4" />
				</Button>
			</div>
		</div>
	);
}
