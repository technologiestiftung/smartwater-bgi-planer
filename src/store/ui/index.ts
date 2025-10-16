import { UiActions, UiState } from "@/store/ui/types";
import { create } from "zustand";

const initialState: UiState = {
	isLayerTreeOpen: false,
	openLegendLayerId: "",
};

export const useUiStore = create<UiState & UiActions>((set) => ({
	...initialState,
	setIsLayerTreeOpen: (isOpen) => set({ isLayerTreeOpen: isOpen }),
	setOpenLegendLayerId: (layerId) => set({ openLegendLayerId: layerId }),
}));
