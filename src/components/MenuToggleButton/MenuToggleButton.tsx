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
	const { setLastPath } = useProjectsStore();
	const { setTutorialState } = useUiStore();
	const isModule =
		pathname.includes("/handlungsbedarfe") || pathname.includes("/machbarkeit");
	const { layerConfigId, layerConfig } = useLayersStore();
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
		<div className="gap fixed top-4 right-4 z-19 flex items-center gap-3">
			{isModule &&
				(currentQuestionConfig?.canDrawNotes ||
					currentQuestionConfig?.canDrawPolygons ||
					currentQuestionConfig?.canDrawBTF) && (
					<div
						className="bg-accent flex size-8 cursor-pointer items-center justify-center rounded-full"
						onClick={() => setTutorialState(true)}
					>
						<InfoIcon className="text-neutral-dark size-6" />
					</div>
				)}
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
	);
}
