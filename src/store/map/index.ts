import { MapActions, MapState } from "@/store/map/types";
import { create } from "zustand";

const initialState: MapState = {
	map: null,
	config: null,
	userLocation: {
		coordinates: null,
		accuracy: undefined,
	},
};

export const useMapStore = create<MapState & MapActions>((set) => ({
	...initialState,
	setConfig: (config) => set({ config }),
	populateMap: (map) => set({ map }),
	removeMap: () => set({ map: null }),
	setUserLocation: (userLocation) => set({ userLocation }),
}));
