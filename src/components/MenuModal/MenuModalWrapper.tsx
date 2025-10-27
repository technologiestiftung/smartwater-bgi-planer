"use client";
import MenuModal from "@/components/MenuModal/MenuModal";
import { PageModal } from "@/components/Modal";
import { usePageModal } from "@/components/Modal/ModalProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface MenuModalWrapperProps {
	projectId: string;
}

const MODAL_ID = "menu-modal";

export default function MenuModalWrapper({ projectId }: MenuModalWrapperProps) {
	const router = useRouter();
	const { open, close, isOpen } = usePageModal(MODAL_ID);

	useEffect(() => {
		open();
	}, [open]);

	const handleClose = () => {
		close();
		// Try to go back first, if that doesn't work, go to home
		if (window.history.length > 1) {
			router.back();
		} else {
			router.push("/");
		}
	};

	return (
		<PageModal
			open={isOpen}
			onOpenChange={(open) => !open && handleClose()}
			title="Menü"
			description="Projektmenü mit Modulen und Informationen"
			bodyClassName=""
			className="max-w-4xl"
		>
			<MenuModal projectId={projectId} />
		</PageModal>
	);
}
