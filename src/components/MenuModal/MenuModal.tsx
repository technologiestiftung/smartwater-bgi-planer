"use client";
import MenuModalContent from "@/components/MenuModal/MenuModalContent";
import { PageModal } from "@/components/Modal";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MenuModalWrapperProps {
	projectId: string;
}

export default function MenuModalWrapper({ projectId }: MenuModalWrapperProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(true);

	useEffect(() => {
		const shouldCloseModal = !pathname.includes("/menu");

		if (shouldCloseModal) {
			setIsOpen(false);
		} else {
			setIsOpen(true);
		}
	}, [pathname]);

	const handleClose = () => {
		router.back();
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
			<MenuModalContent projectId={projectId} />
		</PageModal>
	);
}
