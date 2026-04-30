"use client";

import { Button } from "@/components/ui/button";
import { SectionId } from "@/lib/helpers/sectionIds";
import { useLayersStore } from "@/store";
import { DownloadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useEffect } from "react";

interface SynthesisViewProps {
	onBackToQuestions: () => void;
	onBackToSpecificQuestion: (questionId: string, sectionId: SectionId) => void;
}

export function SynthesisView({ onBackToQuestions }: SynthesisViewProps) {
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);

	useEffect(() => {
		applyConfigLayers("measure_planning_synthesis_view", true);
	}, [applyConfigLayers]);

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex-1 overflow-y-auto px-6 pb-6">
				<p className="text-primary mt-2 max-w-3xl">
					Hier wird später die Auswertung der Maßnahmen mit Berechnungen
					angezeigt.
				</p>
			</div>
			<div className="border-muted bg-secondary flex shrink-0 border-t px-4">
				<Button
					onClick={onBackToQuestions}
					className="text-md my-4 flex-1 text-white hover:text-white"
					size="lg"
					variant="ghost"
				>
					<XIcon className="h-4 w-4" />
					Zu den Maßnahmen
				</Button>
				<div className="w-px self-stretch bg-white" />
				<Button
					onClick={() => undefined}
					className="text-md my-4 flex-1 text-white hover:text-white"
					size="lg"
					variant="ghost"
				>
					<DownloadSimpleIcon className="h-4 w-4" />
					Exportieren
				</Button>
			</div>
		</div>
	);
}
