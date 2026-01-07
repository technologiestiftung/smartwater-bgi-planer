"use client";

import ConfirmButton from "@/components/ConfirmButton/ConfirmButton";
import { SideMenu } from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import AddWMSButton from "@/components/UploadControls/AddWMSButton/AddWMSButton";
import UploadVectorLayersButton from "@/components/UploadControls/UploadVectorLayersButton/UploadVectorLayersButton";
import {
	StepConfig,
	StepContainer,
	StepContent,
	StepIndicator,
	useVerticalStepper,
	VerticalStepper,
} from "@/components/VerticalStepper";
import { useLayerArea } from "@/hooks/use-layer-area";
import { useLayerFeatures } from "@/hooks/use-layer-features";
import { useMapReady } from "@/hooks/use-map-ready";
import { useFilesStore } from "@/store/files";
import { useLayersStore } from "@/store/layers";
import { useMapStore } from "@/store/map";
import { useUiStore } from "@/store/ui";
import { LAYER_IDS } from "@/types/shared";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BlueprintIcon,
	ListChecksIcon,
	MapPinAreaIcon,
	ShovelIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

interface ProjectStarterModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
	onComplete?: () => void;
}

const steps: StepConfig[] = [
	{
		id: "projectBoundary",
		icon: <MapPinAreaIcon />,
		title: "Projektgebiet anlegen",
		description: "xxx",
	},
	{
		id: "newDevelopment",
		icon: <ShovelIcon />,
		title: "Neubauten und Versiegelte Flächen anlegen",
		description: "xxx",
	},
	{
		id: "additionalMaps",
		icon: <BlueprintIcon />,
		title: "Zusatzkarten",
		description: "xxx",
	},
];

// Custom hook for upload status management
function useUploadStatusAutoHide() {
	const { uploadError, uploadSuccess, setUploadError, setUploadSuccess } =
		useUiStore(
			useShallow((state) => ({
				uploadError: state.uploadError,
				uploadSuccess: state.uploadSuccess,
				setUploadError: state.setUploadError,
				setUploadSuccess: state.setUploadSuccess,
			})),
		);

	useEffect(() => {
		if (uploadError || uploadSuccess) {
			const timer = setTimeout(() => {
				if (uploadSuccess) setUploadSuccess(null);
				if (uploadError) setUploadError(null);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [uploadError, uploadSuccess, setUploadError, setUploadSuccess]);

	return { uploadError, uploadSuccess };
}

// Reusable status messages component
function UploadStatusMessages({
	error,
	success,
}: {
	error: string | null;
	success: string | null;
}) {
	return (
		<>
			{error && (
				<div className="text-red mt-4 rounded-sm border border-dashed bg-red-50 p-2 text-sm">
					{error}
				</div>
			)}
			{success && (
				<div className="border-primary bg-light mt-4 rounded-sm border border-dashed p-2 text-sm">
					{success}
				</div>
			)}
		</>
	);
}

function StepperFooter({
	onClose,
	onComplete,
}: {
	onClose: () => void;
	onComplete?: () => void;
}) {
	const {
		previousStep,
		nextStep,
		canGoPrevious,
		canGoNext,
		currentStepId,
		currentStepIndex,
		totalSteps,
	} = useVerticalStepper();
	const { applyConfigLayers, hideLayersByPattern } = useLayersStore(
		useShallow((state) => ({
			applyConfigLayers: state.applyConfigLayers,
			hideLayersByPattern: state.hideLayersByPattern,
		})),
	);
	const clearUploadStatus = useUiStore((state) => state.clearUploadStatus);
	const isMapReady = useMapReady();

	useEffect(() => {
		if (!isMapReady) return;

		const configMap: Record<string, string> = {
			projectBoundary: "start_view_project_boundary",
			newDevelopment: "start_view_project_new_development",
		};

		const config = configMap[currentStepId];
		if (config) applyConfigLayers(config, true);
	}, [currentStepId, applyConfigLayers, isMapReady]);

	const isLastStep = currentStepIndex === totalSteps - 1;

	const handleSkip = () => {
		if (isLastStep) {
			hideLayersByPattern(["uploaded_", "uploaded_wms_"]);
			clearUploadStatus();
			onComplete?.();
		} else {
			nextStep();
		}
	};

	return (
		<div className="border-muted flex h-full w-full border-t">
			<div className="bg-secondary flex w-18 items-center justify-center">
				<ListChecksIcon className="h-6 w-6 text-white" />
			</div>
			<div className="flex w-full items-center justify-between p-2">
				<Button
					variant="ghost"
					onClick={canGoPrevious ? previousStep : onClose}
				>
					<ArrowLeftIcon />
					{canGoPrevious ? "Zurück" : "Schließen"}
				</Button>
				<Button
					variant="ghost"
					onClick={handleSkip}
					disabled={!isLastStep && !canGoNext}
				>
					Überspringen
					<ArrowRightIcon />
				</Button>
			</div>
		</div>
	);
}

function ProjectBoundaryStep() {
	const { hasFeatures } = useLayerFeatures(LAYER_IDS.PROJECT_BOUNDARY);
	const { formattedArea } = useLayerArea(LAYER_IDS.PROJECT_BOUNDARY);
	const { setStepValidation } = useVerticalStepper();
	const clearUploadStatus = useUiStore((state) => state.clearUploadStatus);
	const { uploadError, uploadSuccess } = useUploadStatusAutoHide();
	const [mapError, setMapError] = useState("");

	useEffect(() => {
		setStepValidation("projectBoundary", () => hasFeatures);
	}, [hasFeatures, setStepValidation]);

	const handleConfirm = (): boolean => {
		if (!hasFeatures) {
			setMapError("Bitte zeichnen Sie zuerst ein Projektgebiet ein.");
			return false;
		}
		if (uploadError) return false;
		clearUploadStatus();
		return true;
	};

	return (
		<div className="space-y-4">
			<h3 className="text-primary">Untersuchungsgebiet</h3>
			<p className="text-muted-foreground">
				Das Untersuchungsgebiet soll das ganze Gebiet umfassen, wo Änderungen im
				Rahmen des aktuellen Projektes eingeführt werden können. Sie können
				diese entweder freihand zeichnen oder eine Shapefile oder GeoJSON Datei
				hochladen.
			</p>
			<p>
				Die Blockteilflächen werden automatisch auch selektiert, die mit der
				Projektgrenze überschneiden. Diese sind für die Effektbewertung
				relevant, denn manche Simulationen können nur anhand von ganzen
				Blockteilflächen durchgeführt werden.
			</p>

			<div className="mt-8">
				<ConfirmButton
					onConfirm={handleConfirm}
					validate={() => hasFeatures && !uploadError}
					displayText={formattedArea}
				/>
			</div>

			<UploadStatusMessages error={uploadError} success={uploadSuccess} />
			{mapError && (
				<div className="border-primary text-red mt-4 rounded-sm border border-dashed bg-red-50 p-2 text-sm">
					{mapError}
				</div>
			)}
		</div>
	);
}

function NewDevelopmentStep() {
	const { formattedArea } = useLayerArea("project_new_development");
	const { uploadError, uploadSuccess } = useUploadStatusAutoHide();

	return (
		<div className="space-y-4">
			<h3 className="text-primary">Neubauten und versiegelte Flächen</h3>
			<h4>Welche Bauwerke werden schon geplant?</h4>
			<p className="text-muted-foreground">
				Falls Ihr Projekt Bauvorhaben umfasst, die noch nicht auf der Karte zu
				sehen sind, können Sie diese jetzt einzeichnen.
			</p>
			<p>
				Auch wenn die Planung noch nicht komplett festgelegt ist, können Sie
				Platzhalter einzeichnen, die den Ausmaß der geplanten Gebauten grob
				entsprechen. Diese sind für Simulationen relevant, weil die Gesamtmengen
				von versiegelten und unversiegelten Flächen wichtige Basiswerte sind.
			</p>
			<div className="mt-8">
				<ConfirmButton
					onConfirm={() => true}
					buttonText="Bestätigen"
					displayText={formattedArea}
				/>
			</div>
			<UploadStatusMessages error={uploadError} success={uploadSuccess} />
		</div>
	);
}

function AdditionalMapsStep({ projectId }: { projectId: string }) {
	const clearUploadStatus = useUiStore((state) => state.clearUploadStatus);
	const { uploadError, uploadSuccess } = useUploadStatusAutoHide();
	const { layers, removeLayer } = useLayersStore(
		useShallow((state) => ({
			layers: state.layers,
			removeLayer: state.removeLayer,
		})),
	);
	const map = useMapStore((state) => state.map);
	const deleteFile = useFilesStore((state) => state.deleteFile);

	const uploadedLayers = useMemo(
		() =>
			Array.from(layers.values()).filter(
				(layer) =>
					layer.id.startsWith("uploaded_") ||
					layer.id.startsWith("uploaded_wms_"),
			),
		[layers],
	);

	const deleteLayer = useCallback(
		async (layerId: string) => {
			if (!map) return;

			const _layers = map.getLayers().getArray();
			const layerToRemove = _layers.find(
				(layer) => layer.get("id") === layerId,
			);

			if (layerToRemove) {
				map.removeLayer(layerToRemove);
				await deleteFile(projectId, layerId);
			}

			removeLayer(layerId);
			clearUploadStatus();
		},
		[map, removeLayer, clearUploadStatus, deleteFile, projectId],
	);

	useEffect(() => {
		clearUploadStatus();
	}, [clearUploadStatus]);

	return (
		<div className="space-y-4">
			<h3 className="text-primary">Zusatzkarten</h3>
			<h4>Welche andere Information haben Sie?</h4>
			<p className="text-muted-foreground">
				Falls Sie weitere Karten über das Untersuchungsgebiet zur Verfügung
				haben, die nicht im GeoPortal sind, können Sie diese gerne hier als
				Dateien oder als WMS verlinken.
			</p>

			<div className="flex w-full gap-2 py-4">
				<UploadVectorLayersButton />
				<AddWMSButton />
			</div>

			{uploadedLayers.length > 0 && (
				<div className="max-h-56 space-y-1 overflow-y-auto">
					{uploadedLayers.map((layer) => (
						<div
							key={layer.id}
							className="flex items-center justify-between rounded-sm"
						>
							<span className="text-sm font-medium">{layer.config.name}</span>
							<button
								onClick={() => deleteLayer(layer.id)}
								className="text-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm"
								title="Layer löschen"
							>
								<TrashIcon size={16} />
							</button>
						</div>
					))}
				</div>
			)}

			<UploadStatusMessages error={uploadError} success={uploadSuccess} />
		</div>
	);
}

export default function ProjectStarterModule({
	open,
	onOpenChange,
	onComplete,
	projectId,
}: ProjectStarterModuleProps) {
	const clearUploadStatus = useUiStore((state) => state.clearUploadStatus);

	useEffect(() => () => clearUploadStatus(), [clearUploadStatus]);

	return (
		<SideMenu
			open={open}
			onOpenChange={onOpenChange}
			title="Projekt anlegen"
			description="Untersuchungsgebiet anlegen"
			footer={null}
			bodyClassName="p-0"
		>
			<VerticalStepper steps={steps} initialStepId="projectBoundary">
				<div className="flex h-full w-full flex-col">
					<div className="flex h-full grow pb-4">
						<StepIndicator className="w-20" />
						<StepContainer>
							<StepContent stepId="projectBoundary">
								<ProjectBoundaryStep />
							</StepContent>
							<StepContent stepId="newDevelopment">
								<NewDevelopmentStep />
							</StepContent>
							<StepContent stepId="additionalMaps">
								<AdditionalMapsStep projectId={projectId} />
							</StepContent>
						</StepContainer>
					</div>
					<div className="shrink-0">
						<StepperFooter
							onClose={() => onOpenChange(false)}
							onComplete={onComplete}
						/>
					</div>
				</div>
			</VerticalStepper>
		</SideMenu>
	);
}
