"use client";
import ProjectModal, {
	ProjectFormData,
} from "@/components/ProjectModal/ProjectModal";
import { PageModal } from "@/components/Modal";
import { usePageModal } from "@/components/Modal/ModalProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TrashIcon, FloppyDiskBackIcon } from "@phosphor-icons/react";
import Background from "@/images/background.svg";
import { useState, useEffect } from "react";

interface ProjectModalWrapperProps {
	mode: "new" | "edit";
	projectId?: string;
}

const MODAL_ID = "project-modal";

export default function ProjectModalWrapper({
	mode,
	projectId,
}: ProjectModalWrapperProps) {
	const router = useRouter();
	const { open, close, isOpen } = usePageModal(MODAL_ID);
	const [formData, setFormData] = useState<ProjectFormData>({
		name: "",
		description: "",
		useCase: "individual",
	});
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		open();
	}, [open]);

	const handleClose = () => {
		close();
		if (window.history.length > 1) {
			router.back();
		} else {
			router.push("/");
		}
	};

	const handleSave = async () => {
		if (!formData.name.trim()) {
			alert("Bitte geben Sie einen Projektnamen ein.");
			return;
		}

		setIsSaving(true);

		try {
			if (mode === "new") {
				const projectId = Date.now().toString();

				window.location.href = `/${projectId}`;
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
			onOpenChange={(open) => !open && handleClose()}
			title={title}
			description={description}
			footer={footer}
			customBackdrop={customBackdrop}
		>
			<ProjectModal
				mode={mode}
				projectId={projectId}
				onFormChange={setFormData}
				initialData={formData}
			/>
		</PageModal>
	);
}
