import { LayerConfig } from "@/store/layers/types";
import OLMap from "ol/Map";

// Map View
export interface MapViewOptions {
	resolution: number;
	scale: number;
	zoomLevel: number;
}
export interface MapView {
	startCenter: number[];
	startZoomLevel: number;
}
export interface MapViewConfig extends MapView {
	extent: number[];
	epsg: string;
	options: MapViewOptions[];
}

// Portal & Map Config
export interface PortalMapConfig {
	mapView: MapViewConfig;
}

export interface PortalConfig {
	map: PortalMapConfig;
}

export interface MapConfig {
	portalConfig: PortalConfig;
	layerConfig: LayerConfig;
}

// State
export interface MapState {
	config: MapConfig | null;
	initialConfig: MapConfig | null;
	isConfigReady: boolean;
	map: OLMap | null;
	isReady: boolean;
	hasError: boolean;
	errorMessage: string | null;
	userLocation: {
		coordinates: [number, number] | null;
		accuracy?: number;
	};
	hasHydrated: boolean;
	resetId: number;
	mapView: MapView | null;
}

// Actions
export interface MapActions {
	setConfig: (config: MapConfig) => void;
	setMapView: (view: MapView) => void;
	setInitialConfig: (config: MapConfig) => void;
	setIsConfigReady: (ready: boolean) => void;
	updateConfig: (updates: Partial<MapViewConfig>) => void;
	populateMap: (map: OLMap) => void;
	removeMap: () => void;
	setMapReady: (ready: boolean) => void;
	setMapError: (hasError: boolean, errorMessage?: string) => void;
	setUserLocation: (location: {
		coordinates: [number, number] | null;
		accuracy?: number;
	}) => void;
	setHasHydrated: (state: boolean) => void;
	resetMapState: () => void;
}
