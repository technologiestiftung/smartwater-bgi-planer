"use client";

import { Button } from "@/components/ui/button";
import { SectionId } from "@/lib/helpers/sectionIds";
import { useLayersStore } from "@/store";
import { DownloadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface SynthesisViewProps {
	onBackToQuestions: () => void;
	onBackToSpecificQuestion: (configId: string, sectionId: SectionId) => void;
}
type TestState = "idle" | "loading" | "success" | "error";

export function SynthesisView({ onBackToQuestions }: SynthesisViewProps) {
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);
	const [state, setState] = useState<TestState>("idle");
	const [message, setMessage] = useState<string>("");
	const isDisabled = state === "loading";
	const buttonLabel = useMemo(() => {
		if (state === "loading") {
			return "Rabimo...";
		}
		return "Rabimo Test";
	}, [state]);
	// todo: run rabimo if there is data that needs to be calculated

	useEffect(() => {
		applyConfigLayers("measure_planning_synthesis_view", true);
	}, [applyConfigLayers]);

	const handleTestRequest = useCallback(async () => {
		setState("loading");
		setMessage("");

		try {
			const response = await fetch("/api/rabimo", {
				method: "POST",
			});

			const data: unknown = await response.json();

			if (!response.ok) {
				const errorMessage =
					typeof data === "object" &&
					data !== null &&
					"error" in data &&
					typeof data.error === "string"
						? data.error
						: "Rabimo test request failed";
				throw new Error(errorMessage);
			}

			const summary =
				typeof data === "object" && data !== null
					? `Antwort erhalten (${Object.keys(data).length} Top-Level Felder)`
					: "Antwort erhalten";

			setState("success");
			setMessage(summary);
		} catch (error) {
			setState("error");
			setMessage(
				error instanceof Error
					? error.message
					: "Unbekannter Fehler beim Rabimo-Test",
			);
		}
	}, []);

	// useEffect(() => {
	// 	handleTestRequest();
	// }, []);

	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex-1 overflow-y-auto px-6 pb-6">
				<p className="text-primary mt-2 max-w-3xl">
					Hier wird später die Auswertung der Maßnahmen mit Berechnungen
					angezeigt.
				</p>

				<Button
					variant="map-control"
					size="default"
					onClick={handleTestRequest}
					disabled={isDisabled}
					className="h-12 rounded-xs px-3 text-xs font-semibold"
				>
					{buttonLabel}
				</Button>

				{message && (
					<div
						className={[
							"max-w-48 rounded-xs px-2 py-1 text-xs shadow-md",
							state === "error"
								? "bg-destructive/90 text-white"
								: "bg-background text-foreground",
						].join(" ")}
					>
						{message}
					</div>
				)}
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
