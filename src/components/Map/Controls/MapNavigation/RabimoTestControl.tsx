"use client";

import { Button } from "@/components/ui/button";
import { FC, useCallback, useMemo, useState } from "react";

type TestState = "idle" | "loading" | "success" | "error";

export const RabimoTestControl: FC = () => {
	const [state, setState] = useState<TestState>("idle");
	const [message, setMessage] = useState<string>("");

	const isDisabled = state === "loading";
	const buttonLabel = useMemo(() => {
		if (state === "loading") {
			return "Rabimo...";
		}
		return "Rabimo Test";
	}, [state]);

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

	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	return (
		<div className="flex flex-col gap-2">
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
	);
};
