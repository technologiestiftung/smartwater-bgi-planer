"use client";
import { PageModal } from "@/components/Modal";
import ProjectModalContent, {
	ProjectFormData,
} from "@/components/ProjectModal/ProjectModalContent";
import { Button } from "@/components/ui/button";
import Background from "@/images/background.svg";
import { FloppyDiskBackIcon, TrashIcon } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProjectModalWrapperProps {
	mode: "new" | "edit";
	projectId?: string;
}

export default function ProjectModalWrapper({
	mode,
	projectId,
}: ProjectModalWrapperProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [formData, setFormData] = useState<ProjectFormData>({
		name: "",
		description: "",
		useCase: "individual",
	});
	const [isSaving, setIsSaving] = useState(false);
	const [isOpen, setIsOpen] = useState(true);

	useEffect(() => {
		const shouldCloseModal =
			(mode === "new" && !pathname.includes("/new")) ||
			(mode === "edit" && !pathname.includes("/edit"));

		if (shouldCloseModal) {
			setIsOpen(false);
		}
	}, [pathname, mode]);

	const handleClose = () => {
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
				const projectId = Date.now().toString();
				router.push(`/${projectId}/project-starter`);
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
			<ProjectModalContent
				mode={mode}
				projectId={projectId}
				onFormChange={setFormData}
				initialData={formData}
			/>
		</PageModal>
	);
}
