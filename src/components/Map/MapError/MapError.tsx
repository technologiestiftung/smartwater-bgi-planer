"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { FC } from "react";

interface MapErrorProps {
	message?: string;
	onRetry?: () => void;
}

const MapError: FC<MapErrorProps> = ({
	message = "Die Karte konnte nicht geladen werden",
	onRetry,
}) => {
	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-100/90 backdrop-blur-sm">
			<div className="mx-4 max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
				<div className="mb-4 flex justify-center">
					<AlertTriangle className="h-16 w-16 text-amber-500" />
				</div>

				<h2 className="mb-2 text-lg font-semibold text-gray-900">
					Karte nicht verfügbar
				</h2>

				<p className="mb-4 text-gray-600">
					{message}. Bitte überprüfen Sie Ihre Internetverbindung und versuchen
					Sie es erneut.
				</p>

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
			</div>
		</div>
	);
};

export default MapError;
