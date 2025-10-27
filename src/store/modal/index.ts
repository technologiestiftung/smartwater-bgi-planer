import { ModalsActions, ModalsState } from "@/store/modal/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState: ModalsState = {
	modals: [],
};

export const useModalsStore = create<ModalsState & ModalsActions>()(
	persist(
		(set, get) => ({
			...initialState,
			openModal: (id: string) => {
				set((state) => {
					const existingModal = state.modals.find((m) => m.id === id);
					if (existingModal) {
						return {
							modals: state.modals.map((m) =>
								m.id === id ? { ...m, isOpen: true } : m,
							),
						};
					}
					return {
						modals: [...state.modals, { id, isOpen: true }],
					};
				});
			},
			closeModal: (id: string) => {
				set((state) => ({
					modals: state.modals.map((m) =>
						m.id === id ? { ...m, isOpen: false } : m,
					),
				}));
			},
			isModalOpen: (id: string) => {
				return get().modals.some((modal) => modal.id === id && modal.isOpen);
			},
		}),
		{
			name: "modal-storage",
			partialize: (state) => ({ modals: state.modals }),
		},
	),
);
