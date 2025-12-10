import { MapActions, MapState } from "@/store/map/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState: MapState = {
	map: null,
	config: null,
	initialConfig: null,
	isConfigReady: false,
	shouldInitialize: false,
	mapView: null,
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
		(set, _get) => ({
			...initialState,
			setConfig: (config) => set({ config }),
			setInitialConfig: (initialConfig) => set({ initialConfig }),
			setIsConfigReady: (ready) => set({ isConfigReady: ready }),
			setShouldInitialize: (should) => set({ shouldInitialize: should }),

			setMapView: (mapView) => set({ mapView }),
			updateMapView: (updates) =>
				set((state) => ({
					mapView: state.mapView
						? { ...state.mapView, ...updates }
						: { center: [0, 0], zoomLevel: 1, ...updates },
				})),
			populateMap: (map) => set({ map }),
			removeMap: () => set({ map: null, isReady: false }),
			setMapReady: (ready) => set({ isReady: ready }),
			setMapError: (hasError, errorMessage) =>
				set({ hasError, errorMessage: errorMessage || null }),
			setUserLocation: (userLocation) => set({ userLocation }),
			setHasHydrated: (state) => set({ hasHydrated: state }),
			setIsInitializing: (state) => set({ isInitializing: state }),
			resetMapState: () =>
				set({
					map: null,
					config: null,
					initialConfig: null,
					isConfigReady: false,
					shouldInitialize: false,
					mapView: null,
					isReady: false,
					hasError: false,
					errorMessage: null,
					userLocation: {
						coordinates: null,
						accuracy: undefined,
					},
					hasHydrated: false,
					isInitializing: false,
				}),
		}),
		{
			name: "map-storage",
			partialize: (state) => ({
				config: state.config,
				mapView: state.mapView,
				userLocation: state.userLocation,
			}),
			onRehydrateStorage: () => (state) => {
				console.log("[index] map state::", state);
				state?.setHasHydrated(true);
			},
		},
	),
);
