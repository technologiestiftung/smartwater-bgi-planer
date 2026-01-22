import { MapActions, MapState } from "@/store/map/types";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState: MapState = {
	map: null,
	config: null,
	initialConfig: null,
	isConfigReady: false,
	isReady: false,
	hasError: false,
	errorMessage: null,
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
			setInitialConfig: (initialConfig) => set({ initialConfig }),
			setIsConfigReady: (ready) => set({ isConfigReady: ready }),
			updateConfig: (updates) =>
				set(
					produce((state) => {
						if (!state.config) return;
						const mapView = state.config.portalConfig.map.mapView;
						Object.assign(mapView, updates);
					}),
				),
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
				config: state.config,
				userLocation: state.userLocation,
				// Don't persist resetId - it's only for runtime
			}),
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);
