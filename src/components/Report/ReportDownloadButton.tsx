import { useProjectStore, useResultStore, useScenarioStore } from "@/store";
import { BookOpenTextIcon, SpinnerIcon } from "@phosphor-icons/react";
import { FC, useState } from "react";
import { Button } from "../ui/button";

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

const ReportDownloadButton: FC<ReportDownloadButtonProps> = ({}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const project = useProjectStore((s) => s.project);
	const accumulatedStats = useProjectStore((s) => s.accumulatedStats);
	const activeScenarioId = useScenarioStore((s) => s.activeScenarioId);
	const scenarios = useScenarioStore((s) => s.scenarios);
	const resultsByScenarioId = useResultStore((s) => s.resultsByScenarioId);

	const generateReport = async () => {
		setLoading(true);
		setError(null);

		try {
			const activeScenario = activeScenarioId
				? (scenarios[activeScenarioId] ?? null)
				: null;
			const result = activeScenarioId
				? (resultsByScenarioId[activeScenarioId] ?? null)
				: null;

			const blob = await fetchReport({
				project,
				accumulatedStats,
				activeScenario,
				result,
				datum: new Date().toLocaleDateString("de-DE"),
			});

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
