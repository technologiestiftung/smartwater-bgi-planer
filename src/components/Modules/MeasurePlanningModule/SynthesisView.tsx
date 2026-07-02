"use client";

import ResultChart from "@/components/ResultChart/ResultChart";
import { Button } from "@/components/ui/button";
import { useRabimoPayload } from "@/hooks/useRabimoPayload";
import { useResultLayer } from "@/hooks/useResultLayer";
import { SectionId } from "@/lib/helpers/sectionIds";
import { useLayersStore, useResultStore, useScenarioStore } from "@/store";
import type { Result } from "@/store/result/types";
import { DownloadSimpleIcon, SpinnerIcon, XIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface SynthesisViewProps {
	onBackToQuestions: () => void;
	onBackToSpecificQuestion: (configId: string, sectionId: SectionId) => void;
}
type RequestState = "idle" | "loading" | "success" | "error";

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
	const payload = useRabimoPayload();
	const [state, setState] = useState<RequestState>("idle");
	const [message, setMessage] = useState<string>("");
	const [plotUrl, setPlotUrl] = useState<string | null>(null);
	const [plotState, setPlotState] = useState<RequestState>("idle");

	useResultLayer({
		layerIds: [
			"result_delta_w",
			"result_runoff",
			"result_infiltr",
			"result_evapor",
		],
		dataKey: "water_balance_with_measures",
	});

	useEffect(() => {
		applyConfigLayers("measure_planning_synthesis_view", true);
	}, [applyConfigLayers]);

	const handleRequest = useCallback(async () => {
		if (!activeScenarioId || !payload) return;
		setState("loading");
		setStatus(activeScenarioId, "loading");
		setMessage("");
		setPlotUrl(null);
		setPlotState("idle");

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

			const runoffReductionRaw = (
				data as {
					statistics?: { runoff_reduction_percent?: number | number[] };
				}
			)?.statistics?.runoff_reduction_percent;
			const runoffReduction = Array.isArray(runoffReductionRaw)
				? runoffReductionRaw[0]
				: runoffReductionRaw;

			if (typeof runoffReduction === "number") {
				setPlotState("loading");
				try {
					const plotResponse = await fetch(
						`/api/rabimo/plot-effect-of-disconnect?runoff_reduction=${runoffReduction}&type=critical_hours`,
					);
					if (!plotResponse.ok) throw new Error("Plot request failed");
					const blob = await plotResponse.blob();
					setPlotUrl(URL.createObjectURL(blob));
					setPlotState("success");
				} catch {
					setPlotState("error");
				}
			}

			setState("success");
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

				{state === "loading" && (
					<SpinnerIcon className="animate-spin" size={16} />
				)}

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

				<div className="mt-4">
					<ResultChart />
				</div>

				{plotState === "loading" && (
					<div>
						<SpinnerIcon className="animate-spin" size={16} />
					</div>
				)}

				{plotUrl && (
					<div className="mt-4">
						<Image
							src={plotUrl}
							alt="Effect of disconnect"
							width={620}
							height={400}
							unoptimized
							className="h-auto max-w-full"
							onLoad={() => setPlotState("success")}
							onError={() => setPlotState("error")}
						/>
					</div>
				)}

				<div className="mt-auto pt-6">
					<Image
						src={"/legends/measures.svg"}
						alt="Legende für Maßnahmen"
						width={620}
						height={260}
						className="h-auto max-w-full"
					/>
				</div>
			</div>

			{/* footer */}
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
