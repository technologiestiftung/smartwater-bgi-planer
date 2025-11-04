"use client";
import { PageModal } from "@/components/Modal";
import ProjectModalContent, {
	ProjectFormData,
} from "@/components/ProjectModal/ProjectModalContent";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import Background from "@/images/background.svg";
import {
	DownloadIcon,
	TrashIcon,
	XIcon,
	FloppyDiskBackIcon,
	ArrowLeftIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useProjectsStore } from "@/store/projects";
import { UseCase } from "@/store/projects/types";

interface ProjectModalWrapperProps {
	mode: "new" | "edit";
	projectId?: string;
}

export default function ProjectModalWrapper({
	mode,
	projectId,
}: ProjectModalWrapperProps) {
	const router = useRouter();
	const { createProject, updateProject, getProject, deleteProject } =
		useProjectsStore();

	const { ConfirmDialog, confirm } = useConfirmDialog({
		title: "Projekt löschen",
		content: (
			<div className="border-destructive bg-destructive/10 m-4 flex flex-col items-center gap-4 rounded-xs border-2 border-dashed p-4 text-center">
				<p className="max-w-sm">
					Wollen Sie das aktuelles Projekt <b>endgültig löschen?</b>
				</p>
				<p className="max-w-sm">
					Sollten Sie später weiter arbeiten wollen, klicken Sie bitte “Download
					und speichern”.
				</p>
				<p className="max-w-sm">
					Klicken Sie auf “Löschen” um einen neuen Projekt anfangen zu können.
				</p>
			</div>
		),
		cancelButton: (
			<Button variant="outline">
				<ArrowLeftIcon className="mr-2" />
				Nicht löschen
			</Button>
		),
		confirmButton: (
			<Button>
				<TrashIcon className="mr-2" />
				Löschen
			</Button>
		),
		additionalButtons: (
			<Button variant="outline" onClick={() => console.log("Download")}>
				<DownloadIcon className="mr-2" />
				Download und speichern
			</Button>
		),
	});

	const existingProject =
		mode === "edit" && projectId ? getProject() : undefined;

	const [formData, setFormData] = useState<ProjectFormData>({
		name: existingProject?.name || "",
		description: existingProject?.description || "",
		useCase: existingProject?.useCase || UseCase.Individual,
	});
	const [isSaving, setIsSaving] = useState(false);
	const [isOpen, setIsOpen] = useState(true);

	useEffect(() => {
		if (mode === "edit" && projectId) {
			const project = getProject();
			if (project) {
				setFormData({
					name: project.name,
					description: project.description,
					useCase: project.useCase,
				});
			}
		}
	}, [mode, projectId, getProject]);

	const handleDelete = async () => {
		const confirmed = await confirm();
		if (confirmed) {
			try {
				await deleteProject();
				console.log("Projekt und zugehörige Dateien gelöscht");
				setIsOpen(false);
				router.push("/");
			} catch (error) {
				console.error("Fehler beim Löschen des Projekts:", error);
				alert("Fehler beim Löschen des Projekts.");
			}
		}
	};

	const handleClose = () => {
		setIsOpen(false);
		router.back();
	};

	const handleSave = async () => {
		if (!formData.name.trim()) {
			alert("Bitte geben Sie einen Projektnamen ein.");
			return;
		}

		setIsSaving(true);

		try {
			if (mode === "new") {
				const slug = formData.name
					.toLowerCase()
					.trim()
					.replace(/[^\w\s-]/g, "")
					.replace(/\s+/g, "-")
					.replace(/-+/g, "-");

				const now = new Date();
				const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

				const newProjectId = `${dateStr}_${slug}`;

				createProject({
					id: newProjectId,
					name: formData.name,
					description: formData.description,
					useCase: formData.useCase,
				});

				// setIsOpen(false);
				router.push(`/${newProjectId}`);
			} else if (projectId) {
				updateProject({
					name: formData.name,
					description: formData.description,
					useCase: formData.useCase,
				});
				handleClose();
			}
		} catch (error) {
			console.error("Error saving project:", error);
			alert("Fehler beim Speichern des Projekts.");
		} finally {
			setIsSaving(false);
		}
	};

	const title = mode === "new" ? "Neues Projekt" : "Projektinformationen";
	const description =
		mode === "new"
			? "Erstellen Sie ein neues Projekt mit Namen, Beschreibung und Anwendungsfall"
			: "Bearbeiten Sie die Projektinformationen";

	const footer = (
		<div className="flex gap-2">
			{mode === "edit" && projectId && (
				<Button variant="outline" onClick={handleDelete} disabled={isSaving}>
					<TrashIcon className="mr-2" />
					Projekt löschen
				</Button>
			)}
			<Button variant="outline" onClick={handleClose} disabled={isSaving}>
				<XIcon className="mr-2" />
				Änderungen Verwerfen
			</Button>
			<Button onClick={handleSave} disabled={isSaving}>
				<FloppyDiskBackIcon className="mr-2" />
				{isSaving ? "Speichern..." : "Änderungen Speichern"}
			</Button>
		</div>
	);

	const customBackdrop = (
		<div className="bg-primary absolute -z-99 flex h-full w-full items-center justify-center overflow-hidden">
			<Background className="min-h-full min-w-full flex-shrink-0" />
		</div>
	);

	return (
		<>
			<ConfirmDialog />
			<PageModal
				open={isOpen}
				onOpenChange={() => handleClose()}
				title={title}
				description={description}
				footer={footer}
				customBackdrop={customBackdrop}
			>
				<ProjectModalContent
					mode={mode}
					projectId={projectId}
					onFormChange={setFormData}
					initialData={formData}
				/>
			</PageModal>
		</>
	);
}
