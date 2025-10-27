"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface ModalState {
	id: string;
	isOpen: boolean;
}

interface PageModalContextValue {
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
	isModalOpen: (id: string) => boolean;
}

const PageModalContext = createContext<PageModalContextValue | undefined>(
	undefined,
);

export function PageModalProvider({ children }: { children: React.ReactNode }) {
	const [modals, setModals] = useState<ModalState[]>([]);

	const openModal = useCallback((id: string) => {
		setModals(() => {
			return [{ id, isOpen: true }];
		});
	}, []);

	const closeModal = useCallback((id: string) => {
		setModals((prev) => prev.filter((modal) => modal.id !== id));
	}, []);

	const isModalOpen = useCallback(
		(id: string) => {
			return modals.some((modal) => modal.id === id && modal.isOpen);
		},
		[modals],
	);

	return (
		<PageModalContext.Provider value={{ openModal, closeModal, isModalOpen }}>
			{children}
		</PageModalContext.Provider>
	);
}

export function usePageModal(id: string) {
	const context = useContext(PageModalContext);
	if (!context) {
		throw new Error("usePageModal must be used within PageModalProvider");
	}

	const { openModal, closeModal, isModalOpen } = context;

	const open = useCallback(() => openModal(id), [openModal, id]);
	const close = useCallback(() => closeModal(id), [closeModal, id]);
	const isOpen = isModalOpen(id);

	return {
		open,
		close,
		isOpen,
	};
}
