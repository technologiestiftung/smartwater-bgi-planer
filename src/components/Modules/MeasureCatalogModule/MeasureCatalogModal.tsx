"use client";
import { PageModal } from "@/components/Modal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MeasureCatalogModule from "./MeasureCatalogModule";

interface MeasureCatalogModalProps {
	info: string;
}

export function MeasureCatalogModal({ info }: MeasureCatalogModalProps) {
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
			title="Maßnahmenkatalog"
			className="max-w-6xl"
			bodyClassName="p-0"
		>
			<MeasureCatalogModule info={info} />
		</PageModal>
	);
}
