import { LayerConfig } from "@/store/layers/types";
import OLMap from "ol/Map";

// Map-specific configuration types
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

export interface MapState {
	config: MapConfig | null;
	map: OLMap | null;
	userLocation: {
		coordinates: [number, number] | null;
		accuracy?: number;
	};
}

export interface MapActions {
	setConfig: (config: MapConfig) => void;
	populateMap: (map: OLMap) => void;
	removeMap: () => void;
	setUserLocation: (location: {
		coordinates: [number, number] | null;
		accuracy?: number;
	}) => void;
}
