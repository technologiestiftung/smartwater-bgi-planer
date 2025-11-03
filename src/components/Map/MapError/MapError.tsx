"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { FC, useEffect } from "react";

interface MapErrorProps {
	message?: string;
	onRetry?: () => void;
	onDismiss?: () => void;
	severity?: "error" | "warning";
	autoHide?: boolean;
	autoHideDelay?: number;
}

const MapError: FC<MapErrorProps> = ({
	message = "Die Karte konnte nicht geladen werden",
	onRetry,
	onDismiss,
	severity = "error",
	autoHide = false,
	autoHideDelay = 5000,
}) => {
	useEffect(() => {
		if (autoHide && onDismiss) {
			const timer = setTimeout(() => {
				onDismiss();
			}, autoHideDelay);

			return () => clearTimeout(timer);
		}
	}, [autoHide, autoHideDelay, onDismiss]);
	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-100/90 backdrop-blur-sm">
			<div className="relative mx-4 max-w-md rounded-lg border bg-white p-6 text-center shadow-lg">
				{onDismiss && (
					<button
						onClick={onDismiss}
						className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
						aria-label="Schließen"
					>
						<X className="h-4 w-4" />
					</button>
				)}

				<div className="mb-4 flex justify-center">
					<AlertTriangle
						className={`h-16 w-16 ${
							severity === "warning" ? "text-amber-500" : "text-red-500"
						}`}
					/>
				</div>

				<h2 className="mb-2 text-lg font-semibold text-gray-900">
					{severity === "warning" ? "Layer-Warnung" : "Karte nicht verfügbar"}
				</h2>

				<p className="mb-4 text-gray-600">
					{message}
					{severity === "error" &&
						". Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut."}
				</p>

				<div className="flex justify-center gap-2">
					{onRetry && (
						<Button
							onClick={onRetry}
							variant="outline"
							className="flex items-center gap-2"
						>
							<RefreshCw className="h-4 w-4" />
							Erneut versuchen
						</Button>
					)}

					{onDismiss && severity === "warning" && (
						<Button onClick={onDismiss} variant="secondary">
							Schließen
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default MapError;
