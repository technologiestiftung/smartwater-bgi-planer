"use client";

import WaterBalanceChart from "@/components/ResultCharts/WaterBalanceChart";
import WaterQualityChart from "@/components/ResultCharts/WaterQualityChart";
import { Button } from "@/components/ui/button";
import { useRabimoPayload } from "@/hooks/useRabimoPayload";
import { useResultLayer } from "@/hooks/useResultLayer";
import { SectionId } from "@/lib/helpers/sectionIds";
import { PlotType } from "@/server/rabimo/types";
import { useLayersStore, useResultStore, useScenarioStore } from "@/store";
import type { Result } from "@/store/result/types";
import { ResultStatistics } from "@/types/result";
import { DownloadSimpleIcon, XIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const CACHE_MAX_SIZE = 20;

function setWithSizeLimit<K, V>(map: Map<K, V>, key: K, value: V): void {
	if (!map.has(key) && map.size >= CACHE_MAX_SIZE) {
		const oldest = map.keys().next().value;
		if (oldest !== undefined) map.delete(oldest);
	}
	map.set(key, value);
}

const plotsCache = new Map<number, Partial<Record<PlotType, string>>>();
const lastRequestByScenarioId = new Map<
	string,
	{ payloadKey: string; runoffReduction: number | undefined }
>();

interface SynthesisViewProps {
	onBackToQuestions: () => void;
	onBackToSpecificQuestion: (configId: string, sectionId: SectionId) => void;
}
type RequestState = "idle" | "loading" | "success" | "error";

export function SynthesisView({ onBackToQuestions }: SynthesisViewProps) {
	const applyConfigLayers = useLayersStore((state) => state.applyConfigLayers);
	const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
	const setResult = useResultStore((state) => state.setResult);
	const setStatus = useResultStore((state) => state.setStatus);
	const payload = useRabimoPayload();
	const [state, setState] = useState<RequestState>("idle");
	const [error, setError] = useState<string>("");
	const [plotUrls, setPlotUrls] = useState<Partial<Record<PlotType, string>>>(
		{},
	);
	const [plotState, setPlotState] = useState<RequestState>("idle");

	const result = useResultStore((storeState) =>
		activeScenarioId
			? storeState.resultsByScenarioId[activeScenarioId]
			: undefined,
	);
	const stats = result?.data
		? (result.data as { statistics: ResultStatistics }).statistics
		: undefined;

	useResultLayer({
		layerIds: [
			"result_delta_w",
			"result_runoff",
			"result_infiltr",
			"result_evapor",
		],
		dataKey: "water_balance.with_measures",
	});

	useEffect(() => {
		applyConfigLayers("measure_planning_synthesis_view", true);
	}, [applyConfigLayers]);

	const restoreFromCache = useCallback(
		(scenarioId: string, payloadKey: string): boolean => {
			const last = lastRequestByScenarioId.get(scenarioId);
			if (last?.payloadKey !== payloadKey) return false;
			const existingResult =
				useResultStore.getState().resultsByScenarioId[scenarioId];
			if (!existingResult) return false;
			if (
				last.runoffReduction !== undefined &&
				plotsCache.has(last.runoffReduction)
			) {
				setPlotUrls(plotsCache.get(last.runoffReduction)!);
				setPlotState("success");
			}
			setState("success");
			return true;
		},
		[],
	);

	const fetchPlots = useCallback(async (runoffReduction: number) => {
		if (plotsCache.has(runoffReduction)) {
			setPlotUrls(plotsCache.get(runoffReduction)!);
			setPlotState("success");
			return;
		}
		setPlotState("loading");
		try {
			const res = await fetch(
				`/api/rabimo/plot-effect-of-disconnect?runoff_reduction=${runoffReduction}`,
			);
			if (!res.ok) {
				setPlotState("error");
				return;
			}
			const data = (await res.json()) as Partial<Record<PlotType, string>>;
			setWithSizeLimit(plotsCache, runoffReduction, data);
			setPlotUrls(data);
			setPlotState("success");
		} catch {
			setPlotState("error");
		}
	}, []);

	// eslint-disable-next-line complexity
	const handleRequest = useCallback(async () => {
		if (!activeScenarioId || !payload) return;

		const payloadKey = JSON.stringify(payload);

		if (restoreFromCache(activeScenarioId, payloadKey)) return;

		const requestScenarioId = activeScenarioId;
		setState("loading");
		setStatus(requestScenarioId, "loading");
		setError("");
		setPlotUrls({});
		setPlotState("idle");

		try {
			const response = await fetch("/api/rabimo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data: unknown = await response.json();

			if (useScenarioStore.getState().activeScenarioId !== requestScenarioId) {
				return;
			}

			if (!response.ok) {
				setStatus(requestScenarioId, "error");
				const message =
					(data as { error?: string })?.error ?? "Rabimo request failed";
				throw new Error(message);
			}

			const newResult: Result = {
				id: `${requestScenarioId}-${Date.now()}`,
				scenarioId: requestScenarioId,
				timestamp: Date.now(),
				payloadKey,
				data: data as Record<string, unknown>,
			};

			setResult(requestScenarioId, newResult);
			setStatus(requestScenarioId, "done");

			const runoffReductionRaw = (
				data as {
					statistics?: { runoff_reduction_percent?: number | number[] };
				}
			)?.statistics?.runoff_reduction_percent;
			const runoffReduction = Array.isArray(runoffReductionRaw)
				? runoffReductionRaw[0]
				: runoffReductionRaw;

			if (typeof runoffReduction === "number") {
				await fetchPlots(runoffReduction);
			}

			if (useScenarioStore.getState().activeScenarioId !== requestScenarioId) {
				return;
			}

			setWithSizeLimit(lastRequestByScenarioId, requestScenarioId, {
				payloadKey,
				runoffReduction:
					typeof runoffReduction === "number" ? runoffReduction : undefined,
			});

			setState("success");
		} catch (error) {
			setState("error");
			setError(error instanceof Error ? error.message : "Unbekannter Fehler");
		}
	}, [
		activeScenarioId,
		fetchPlots,
		payload,
		restoreFromCache,
		setResult,
		setStatus,
	]);

	useEffect(() => {
		queueMicrotask(() => {
			handleRequest();
		});
	}, [handleRequest]);

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex-1 overflow-y-auto px-6 pb-6">
				<h3>Effektbewertung</h3>
				{error && (
					<div className="border-primary text-red mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed p-4 text-center transition-colors">
						<span>Effektbewertung konnte nicht geladen werden.</span>
					</div>
				)}

				<div className="mt-4">
					<WaterBalanceChart stats={stats} isLoading={state === "loading"} />

					<p className="mt-4">
						Für den ausgewählten Projektbereich berechnet das Modell ABIMO die
						drei Komponenten des Wasserhaushalts in Millimetern pro Jahr: den
						kanalisierten Oberflächenabfluss, die Evapotranspiration – also die
						Verdunstung über Oberflächen und Pflanzen – sowie die Versickerung.
						Die Berechnung erfolgt für den Ist-Zustand, den Planungszustand und
						ein idealisiertes naturnahes Szenario. Als Referenz dient dabei ein
						unversiegelter Stadtpark mit Mischvegetation. Durch den Vergleich
						des Ist- und Planungszustands mit dem naturnahen Referenzszenario
						wird jeweils der Parameter ΔW ermittelt. Dieser gibt in Prozent an,
						wie stark der Wasserhaushalt eines Gebiets vom naturnahen Zustand
						abweicht. Die folgenden Grafiken zeigen, wie die geplanten Maßnahmen
						den Wasserhaushalt verbessern und den ΔW-Wert verringern. Die Werte
						der einzelnen ausgewählten Blockteilflächen werden dabei zu einem
						flächengewichteten Mittelwert zusammengefasst.
					</p>

					<br />

					<WaterQualityChart
						stats={stats}
						isLoading={state === "loading"}
						plotUrls={plotUrls}
						plotState={plotState}
					/>

					<div className="mt-4 flex flex-col gap-2">
						<p>
							Die Auswirkungen geplanter BGI-Maßnahmen auf die Gewässerbelastung
							werden mithilfe eines vereinfachten, datenbasierten Modells
							abgeschätzt. Grundlage sind umfangreiche hydrodynamische
							Simulationen des Berliner Mischwassersystems mit dem
							Mischkanalnetzmodell (InfoWorks ICM) und dem gekoppelten
							Gewässergütemodell (GERRIS/HYDRAX/QSim).
						</p>
						<p>
							Aus den geplanten Maßnahmen wird zunächst die Verringerung des
							Regenabflusses in die Mischkanalisation ermittelt. Für die
							Wirkungsabschätzung wird diese Abflussreduktion auf die
							angeschlossenen versiegelten Flächen aller 18 Berliner
							Mischwassereinzugsgebiete hochgerechnet und über die aus den
							Modellrechnungen abgeleiteten Wirkungszusammenhänge in
							Veränderungen der Gewässerbelastung übersetzt.
						</p>
						<p>
							Die Ergebnisse werden anhand der Kennwerte „Unterschreitungsdauer
							in Stunden“ und „Anzahl kritischer O₂-Ereignisse“ dargestellt.
							Beide Kennwerte beziehen sich auf Sauerstoffkonzentrationen unter
							1,5 mg/L, die als fischkritisch gelten und zu Fischsterben führen
							können. Je geringer die Unterschreitungsdauer und je weniger
							kritische O₂-Ereignisse auftreten, desto geringer ist die
							Belastung der Gewässer durch Mischwasserüberläufe.
						</p>
						<p>
							Für den berlinweiten Vorher-Nachher-Vergleich werden die
							Ergebnisse aller Gewässerabschnitte zu einem Kennwert
							zusammengefasst. Hierfür wird für die Unterschreitungsdauer der
							Median und für die Anzahl kritischer O₂-Ereignisse der Mittelwert
							über alle Gewässerabschnitte gebildet. Die Kartendarstellung zeigt
							dagegen die berechneten Kennwerte für jeden Gewässerabschnitt
							separat.
						</p>
					</div>
				</div>

				<div className="mt-auto pt-6">
					<Image
						src={"/legends/measures.svg"}
						loading="eager"
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
