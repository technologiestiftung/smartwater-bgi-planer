export type LayerType = "WMS" | "WFS" | "WMTS" | "VectorTile" | "GEOJSON";
export type LayerStatus = "initial" | "loading" | "loaded" | "error";

export const LAYER_IDS = {
	PROJECT_BOUNDARY: "project_boundary",
	PROJECT_BTF_PLANNING: "project_btf_planning",
	INPUT: "rabimo_input_2025",
	PROJECT_NEW_DEVELOPMENT: "project_new_development",
	CONNECTED_AREA_DRAW: "module_3_connected_area_draw",
	CONNECTED_AREA: "connected_area",
} as const;

export type LayerId = (typeof LAYER_IDS)[keyof typeof LAYER_IDS];

export interface UploadedFile {
	file: File;
	id: string;
}

export interface InvalidFile {
	name: string;
	reason: string;
}

export interface AddressFeature {
	type: "Feature";
	properties: {
		name: string;
		street?: string;
		city?: string;
		district?: string;
		postcode?: string;
		osm_type?: string;
		osm_id?: number;
		type?: string;
	};
	geometry: {
		type: "Point";
		coordinates: [number, number];
	};
	bbox?: [number, number, number, number];
}

export interface ModuleStepConfig {
	id: string;
	icon: string;
	title: string;
	questions?: string[];
	measurements?: ModuleMeasurementConfig[];
	displayInSynthesis?: boolean;
}

export interface ModuleMeasurementConfig {
	id: string;
	layerConfigId?: string;
	title?: string;
	metricIcons?: string[];
	infoLayerConfigId?: string;
	steps?: string[];
}

export interface ModuleConfig {
	id: string;
	order: number;
	title: string;
	description: string;
	steps: ModuleStepConfig[];
}

export interface ModulesConfigFile {
	modules: ModuleConfig[];
}
