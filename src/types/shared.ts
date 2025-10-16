export type LayerType = "WMS" | "WFS" | "WMTS" | "VectorTile" | "GEOJSON";
export type LayerStatus = "initial" | "loading" | "loaded" | "error";

export const LAYER_IDS = {
	PROJECT_BOUNDARY: "project_boundary",
	PROJECT_BTF_PLANNING: "project_btf_planning",
	RABIMO_INPUT_2025: "rabimo_input_2025",
} as const;

export type LayerId = (typeof LAYER_IDS)[keyof typeof LAYER_IDS];
