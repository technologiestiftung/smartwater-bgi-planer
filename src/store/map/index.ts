import { MapActions, MapState } from "@/store/map/types";
import { create } from "zustand";

const initialState: MapState = {
	map: null,
	config: null,
	isReady: false,
	userLocation: {
		coordinates: null,
		accuracy: undefined,
	},
};

export const useMapStore = create<MapState & MapActions>((set) => ({
	...initialState,
	setConfig: (config) => set({ config }),
	populateMap: (map) => set({ map }),
	removeMap: () => set({ map: null, isReady: false }),
	setMapReady: (ready) => set({ isReady: ready }),
	setUserLocation: (userLocation) => set({ userLocation }),
}));
