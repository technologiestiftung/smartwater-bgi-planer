"use client";

import { useModalsStore } from "@/store";

export function PageModalProvider({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

export function usePageModal(id: string) {
	const openModal = useModalsStore((state) => state.openModal);
	const closeModal = useModalsStore((state) => state.closeModal);
	const isOpen = useModalsStore(
		(state) => state.modals.find((m) => m.id === id)?.isOpen ?? false,
	);

	return {
		open: () => openModal(id),
		close: () => closeModal(id),
		isOpen,
	};
}
