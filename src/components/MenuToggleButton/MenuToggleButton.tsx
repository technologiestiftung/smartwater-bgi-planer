"use client";

import { Button } from "@/components/ui/button";
import SWLogo from "@/logos/SWLogo.svg";
import { useLayersStore, useProjectsStore, useUiStore } from "@/store";
import { InfoIcon, ListIcon } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";

interface MenuToggleButtonProps {
	projectId: string;
}

export function MenuToggleButton({ projectId }: MenuToggleButtonProps) {
	const router = useRouter();
	const pathname = usePathname();
	const setLastPath = useProjectsStore((state) => state.setLastPath);

	const showTutorial = useUiStore((state) => state.showTutorial);
	const setTutorialState = useUiStore((state) => state.setTutorialState);

	const layerConfigId = useLayersStore((state) => state.layerConfigId);
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const isModule =
		pathname.includes("/handlungsbedarfe") || pathname.includes("/machbarkeit");
	const currentQuestionConfig = layerConfig.find(
		(config) => config.id === layerConfigId,
	);

	const handleToggle = () => {
		if (pathname.includes("/menu")) {
			router.back();
		} else {
			setLastPath(pathname);
			router.push(`/${projectId}/menu`);
		}
	};

	return (
		<div className="fixed top-4 right-4 z-[51] flex items-center gap-3">
			{isModule &&
				(currentQuestionConfig?.canDrawNotes ||
					currentQuestionConfig?.canDrawPolygons ||
					currentQuestionConfig?.canDrawBTF) && (
					<div className="relative inline-flex">
						{showTutorial && (
							<span className="bg-accent/80 absolute inset-0 animate-ping rounded-full [animation-duration:1s] [animation-fill-mode:forwards] [animation-iteration-count:3]" />
						)}
						<button
							type="button"
							className="bg-accent flex size-8 cursor-pointer items-center justify-center rounded-full"
							onClick={() => setTutorialState(!showTutorial)}
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
					{showTutorial && <span className="absolute inset-0 bg-black/58" />}
					<SWLogo className="size-36" />
					<ListIcon className="text-primary size-4" />
				</Button>
			</div>
		</div>
	);
}
