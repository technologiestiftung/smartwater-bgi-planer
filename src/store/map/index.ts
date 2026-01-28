import { MapActions, MapState } from "@/store/map/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState: MapState = {
	map: null,
	config: null,
	isInitializeReady: false,
	isReady: false,
	hasError: false,
	errorMessage: null,
	mapView: null,
	userLocation: {
		coordinates: null,
		accuracy: undefined,
	},
	hasHydrated: false,
	resetId: 0,
};

export const useMapStore = create<MapState & MapActions>()(
	persist(
		(set, _get) => ({
			...initialState,
			setConfig: (config) => set({ config }),
			setIsInitializeReady: (ready) => set({ isInitializeReady: ready }),
			setMapView: (mapView) => set({ mapView }),
			populateMap: (map) => set({ map }),
			removeMap: () => set({ map: null, isReady: false }),
			setMapReady: (ready) => set({ isReady: ready }),
			setMapError: (hasError, errorMessage) =>
				set({ hasError, errorMessage: errorMessage || null }),
			setUserLocation: (userLocation) => set({ userLocation }),
			setHasHydrated: (state) => set({ hasHydrated: state }),
			resetMapState: () => {
				const currentMap = _get().map;
				if (currentMap) {
					currentMap.getLayers().clear();
					currentMap.setTarget(undefined);
					currentMap.dispose();
				}

				set({
					...initialState,
					hasHydrated: true,
					resetId: _get().resetId + 1,
				});
			},
		}),
		{
			name: "map-storage",
			partialize: (state) => ({
				mapView: state.mapView,
				userLocation: state.userLocation,
			}),
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);
