"use client";
import { PageModal } from "@/components/Modal";
import ProjectModalContent, {
	ProjectFormData,
} from "@/components/ProjectModal/ProjectModalContent";
import { Button } from "@/components/ui/button";
import Background from "@/images/background.svg";
import { FloppyDiskBackIcon, TrashIcon } from "@phosphor-icons/react";
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
	const { createProject, updateProject, getProject } = useProjectsStore();

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
					files: [],
					attachments: [],
				});

				setIsOpen(false);
				requestAnimationFrame(() => {
					router.push(`/${newProjectId}`);
				});
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
			<Button variant="outline" onClick={handleClose} disabled={isSaving}>
				<TrashIcon className="mr-2" />
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
	);
}
