"use client";
import { MenuModalContent } from "@/components/MenuModal/MenuModalContent";
import { PageModal } from "@/components/Modal";
import { useProjectStore } from "@/store/project";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface MenuModalProps {
	projectId: string;
}

export function MenuModal({ projectId }: MenuModalProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(true);
	const { hasHydrated, deleteTheProject, getProject } = useProjectStore();

	const handleClose = () => {
		setIsOpen(false);
		router.back();
	};

	useEffect(() => {
		if (!hasHydrated || !deleteTheProject) return;
		const project = getProject();
		router.replace(`/${project?.id}/delete`);
	}, [hasHydrated, deleteTheProject]);

	return (
		<PageModal
			open={isOpen}
			onOpenChange={() => handleClose()}
			title="Menü"
			description="Projektmenü mit Modulen und Informationen"
			bodyClassName=""
			className="max-w-4xl"
		>
			<MenuModalContent projectId={projectId} />
		</PageModal>
	);
}
