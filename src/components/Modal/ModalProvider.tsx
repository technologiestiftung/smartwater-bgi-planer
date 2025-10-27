"use client";

import { useModalsStore } from "@/store";

export function PageModalProvider({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

export function usePageModal(id: string) {
	const { openModal, closeModal, isModalOpen } = useModalsStore();

	return {
		open: () => openModal(id),
		close: () => closeModal(id),
		isOpen: isModalOpen(id),
	};
}
