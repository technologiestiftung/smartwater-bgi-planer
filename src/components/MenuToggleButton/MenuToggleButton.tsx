"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SWLogo from "@/logos/SWLogo.svg";
import { useProjectStore, useUiStore } from "@/store";
import { selectActiveLayerConfig, useLayersStore } from "@/store/layers";
import { InfoIcon, ListIcon } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface MenuToggleButtonProps {
	projectId: string;
}

// eslint-disable-next-line complexity
export function MenuToggleButton({ projectId }: MenuToggleButtonProps) {
	const searchParams = useSearchParams();
	const moveToTheBack = searchParams.has("cityClimateSimulation");
	const router = useRouter();
	const pathname = usePathname();
	const setLastPath = useProjectStore((state) => state.setLastPath);

	const showTutorial = useUiStore((state) => state.showTutorial);
	const setTutorialState = useUiStore((state) => state.setTutorialState);

	const currentLayerConfig = useLayersStore(selectActiveLayerConfig);
	const isModule =
		pathname.includes("/handlungsbedarfe") || pathname.includes("/machbarkeit");

	const handleToggle = () => {
		if (pathname.includes("/menu")) {
			router.back();
		} else {
			setLastPath(pathname);
			router.push(`/${projectId}/menu`);
		}
	};

	return (
		<div
			className={cn(
				"fixed top-4 right-4 flex items-center gap-3",
				!moveToTheBack && "z-40",
			)}
		>
			{isModule &&
				(currentLayerConfig?.canDrawNotes ||
					currentLayerConfig?.canDrawPolygons ||
					currentLayerConfig?.canDrawBTF) && (
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
