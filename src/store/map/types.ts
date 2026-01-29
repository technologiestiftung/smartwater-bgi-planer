import { LayerConfig } from "@/store/layers/types";
import OLMap from "ol/Map";

export interface MapViewOptions {
	resolution: number;
	scale: number;
	zoomLevel: number;
}

export interface MapViewConfig {
	backgroundImage: string;
	startCenter: number[];
	extent: number[];
	epsg: string;
	startZoomLevel: number;
	options: MapViewOptions[];
}

export interface PortalMapConfig {
	controls: {
		zoom: boolean;
		orientation: {
			zoomMode: string;
		};
	};
	mapView: MapViewConfig;
}

export interface PortalConfig {
	map: PortalMapConfig;
	portalFooter?: { urls: string[] };
}

export interface MapConfig {
	portalConfig: PortalConfig;
	layerConfig: LayerConfig;
}

export interface MapView {
	startCenter: number[];
	startZoomLevel: number;
}

export interface MapViewOption {
	zoomLevel: number;
	resolution: number;
}

export interface UserLocation {
	coordinates: [number, number] | null;
	accuracy?: number;
}

export interface MapState {
	config: MapConfig | null;
	isInitializeReady: boolean;
	map: OLMap | null;
	isReady: boolean;
	hasError: boolean;
	errorMessage: string | null;
	mapView: MapView | null;
	userLocation: UserLocation;
	hasHydrated: boolean;
	resetId: number;
}

export interface MapActions {
	setConfig: (config: MapConfig) => void;
	setIsInitializeReady: (ready: boolean) => void;
	setMapView: (mapView: MapView) => void;
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
