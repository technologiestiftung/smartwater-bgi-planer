export type LayerType = "WMS" | "WFS" | "WMTS" | "VectorTile" | "GEOJSON";
export type LayerStatus = "initial" | "loading" | "loaded" | "error";

export const LAYER_IDS = {
	PROJECT_BOUNDARY: "project_boundary",
	PROJECT_BTF_PLANNING: "project_btf_planning",
	RABIMO_INPUT_2025: "rabimo_input_2025",
	PROJECT_NEW_DEVELOPMENT: "project_new_development",
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

export interface FileUploadZoneProps {
	accept?: string;
	onFilesChange?: (files: File[]) => void;
	className?: string;
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
