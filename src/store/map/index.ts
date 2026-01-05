import { MapActions, MapState } from "@/store/map/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState: MapState = {
	map: null,
	config: null,
	isReady: false,
	hasError: false,
	errorMessage: null,
	userLocation: {
		coordinates: null,
		accuracy: undefined,
	},
	hasHydrated: false,
	isInitializing: false,
};

export const useMapStore = create<MapState & MapActions>()(
	persist(
		(set) => ({
			...initialState,
			setConfig: (config) => set({ config }),
			populateMap: (map) => set({ map }),
			removeMap: () => set({ map: null, isReady: false }),
			setMapReady: (ready) => set({ isReady: ready }),
			setMapError: (hasError, errorMessage) =>
				set({ hasError, errorMessage: errorMessage || null }),
			setUserLocation: (userLocation) => set({ userLocation }),
			setHasHydrated: (state) => set({ hasHydrated: state }),
			setIsInitializing: (state) => set({ isInitializing: state }),
		}),
		{
			name: "map-storage",
			partialize: (state) => ({
				config: state.config,
				userLocation: state.userLocation,
			}),
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);
