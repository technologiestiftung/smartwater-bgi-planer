import {
	useAnswersStore,
	useMapStore,
	useProjectStore,
	useScenarioStore,
	useResultStore,
} from "@/store";
import Map from "ol/Map";
import { BookOpenTextIcon, SpinnerIcon } from "@phosphor-icons/react";
import { FC, useState } from "react";
import { Button } from "../ui/button";
import modulesData from "@/components/Modules/modules.json";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { ResultStatistics } from "@/types/result";

interface ReportDownloadButtonProps {}

async function fetchReport(body: object): Promise<Blob> {
	const response = await fetch("/api/report", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			(errorData as { error?: string }).error ??
				`Server error: ${response.status}`,
		);
	}

	return response.blob();
}

function triggerDownload(blob: Blob, filename: string) {
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
}

function getAllNotes(map: Map) {
	if (!map) {
		return [];
	}
	return map.getAllLayers().flatMap((layer) => {
		if (!(layer instanceof VectorLayer)) return [];

		const source = layer.getSource();
		if (!(source instanceof VectorSource)) return [];

		return source
			.getFeatures()
			.filter((feature) => feature.get("note"))
			.map((feature) => ({
				layerId: layer.get("id"),
				feature,
				note: feature.get("note"),
			}));
	});
}

const ReportDownloadButton: FC<ReportDownloadButtonProps> = ({}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const project = useProjectStore((s) => s.project);
	const activeScenarioId = useScenarioStore((s) => s.activeScenarioId);
	const scenarios = useScenarioStore((s) => s.scenarios);

	const answers = useAnswersStore((state) => state.answers);

	const map = useMapStore((state) => state.map);
	const notes = getAllNotes(map as Map);

	const result = useResultStore((storeState) =>
		activeScenarioId ? storeState.resultsByScenarioId[activeScenarioId] : null,
	);
	const stats = result?.data
		? (result.data as { statistics: ResultStatistics }).statistics
		: null;

	const generateReport = async () => {
		setLoading(true);
		setError(null);

		try {
			const activeScenario = activeScenarioId
				? (scenarios[activeScenarioId] ?? null)
				: null;

			const allQuestionIDs = modulesData.modules
				.filter((module) => module.id !== "measurePlanning")
				.flatMap((module) =>
					module.steps.flatMap((step) =>
						"questions" in step
							? step.questions.filter(
									(id) =>
										!id.includes("starter_question") &&
										!id.includes("module_introduction"),
								)
							: [],
					),
				);

			const measures: Record<string, boolean | null> = {};
			allQuestionIDs.forEach((id) => {
				measures[id] = answers[id] ?? null;
			});

			const body = {
				project,
				activeScenario,
				stats,
				datum: new Date().toLocaleDateString("de-DE"),
				measures,
				notes: notes.map((n) => n.note),
			};

			const blob = await fetchReport(body);
			triggerDownload(blob, `Report_${project?.name}.pdf`);
		} catch (err) {
			console.error("Report generation error:", err);
			const errorMessage =
				err instanceof Error ? err.message : "Unbekannter Fehler";
			setError(`Fehler beim Erstellen des PDF: ${errorMessage}`);
		} finally {
			setTimeout(() => setLoading(false), 500);
		}
	};

	return (
		<div className="ReportDownloadButton-root">
			{error && (
				<div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
					<strong>Fehler:</strong> {error}
				</div>
			)}

			<Button variant="outline" onClick={generateReport} disabled={loading}>
				{loading && <SpinnerIcon className="animate-spin" />}
				<BookOpenTextIcon />
				{loading ? "Generiere PDF..." : "Gesamter Report"}
			</Button>
		</div>
	);
};

export default ReportDownloadButton;
