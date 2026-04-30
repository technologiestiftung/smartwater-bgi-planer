"use client";
import { MenuModalContent } from "@/components/MenuModal/MenuModalContent";
import { PageModal } from "@/components/Modal";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MenuModalProps {
	projectId: string;
}

export function MenuModal({ projectId }: MenuModalProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(true);

	const handleClose = () => {
		setIsOpen(false);
		router.back();
	};

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
