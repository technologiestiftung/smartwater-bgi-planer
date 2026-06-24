"use client";

import { Button } from "@/components/ui/button";
import { useRabimoPayload } from "@/hooks/useRabimoPayload";
import { SectionId } from "@/lib/helpers/sectionIds";
import { useLayersStore, useResultStore, useScenarioStore } from "@/store";
import type { Result } from "@/store/result/types";
import { DownloadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface SynthesisViewProps {
	onBackToQuestions: () => void;
	onBackToSpecificQuestion: (configId: string, sectionId: SectionId) => void;
}
type TestState = "idle" | "loading" | "success" | "error";

function extractErrorMessage(data: unknown, fallback: string): string {
	if (
		typeof data === "object" &&
		data !== null &&
		"error" in data &&
		typeof (data as Record<string, unknown>).error === "string"
	) {
		return (data as Record<string, unknown>).error as string;
	}
	return fallback;
}

export function SynthesisView({ onBackToQuestions }: SynthesisViewProps) {
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const setResult = useResultStore((state) => state.setResult);
	const setStatus = useResultStore((state) => state.setStatus);
	const result = useResultStore((state) =>
		activeScenarioId ? state.resultsByScenarioId[activeScenarioId] : undefined,
	);
	const payload = useRabimoPayload();
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

	const handleRequest = useCallback(async () => {
		if (!activeScenarioId || !payload) return;

		console.log("[SynthesisView] payload::", payload);

		setState("loading");
		setStatus(activeScenarioId, "loading");
		setMessage("");

		try {
			const response = await fetch("/api/rabimo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data: unknown = await response.json();

			if (!response.ok) {
				setStatus(activeScenarioId, "error");
				throw new Error(
					extractErrorMessage(data, "Rabimo test request failed"),
				);
			}

			const newResult: Result = {
				id: `${activeScenarioId}-${Date.now()}`,
				scenarioId: activeScenarioId,
				timestamp: Date.now(),
				data: data as Record<string, unknown>,
			};

			setResult(activeScenarioId, newResult);
			setStatus(activeScenarioId, "done");

			const summary =
				typeof data === "object" && data !== null
					? `Antwort erhalten (${Object.keys(data).length} Top-Level Felder)`
					: "Antwort erhalten";

			setState("success");

			console.log("[SynthesisView] data::", data);

			setMessage(summary);
		} catch (error) {
			setState("error");
			setMessage(
				error instanceof Error
					? error.message
					: "Unbekannter Fehler beim Rabimo-Test",
			);
		}
	}, [activeScenarioId, payload, setResult, setStatus]);

	useEffect(() => {
		handleRequest();
	}, [handleRequest]);

	if (process.env.NODE_ENV !== "development") {
		<div className="flex h-full w-full flex-col">
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
		</div>;
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
					onClick={handleRequest}
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

				{result && (
					<pre className="bg-muted text-foreground mt-4 overflow-x-auto rounded-sm p-3 text-xs">
						{JSON.stringify(result.data, null, 2)}
					</pre>
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
