import { LayerStatus, LayerType } from "@/types/shared";
import { Layer } from "ol/layer";

// Layer-specific types
export interface LayerElementBase {
	id: string;
	name?: string;
	type?: string;
	visibility?: boolean;
	showInLayerTree?: boolean;
	elements: (LayerElementBase | LayerFolder)[];
}

export interface LayerFolder {
	name: string;
	type: "folder";
	description?: string;
	elements: (LayerElementBase | LayerFolder)[];
}

export interface LayerElement extends LayerElementBase {
	id: string;
	visibility: boolean;
	status: LayerStatus;
	service?: LayerService;
	zIndex?: number;
}

export interface ManagedLayer {
	id: string;
	config: LayerElement;
	olLayer: Layer | null;
	status: LayerStatus;
	visibility: boolean;
	opacity: number;
	zIndex: number;
	layerType: "base" | "subject";
	error?: string;
}

export interface Dataset {
	md_id: string;
	rs_id: string;
	csw_url: string;
	show_doc_url: string;
}

export interface LayerService {
	id: string;
	name: string;
	name_lang?: string;
	capabilitiesUrl?: string;
	url?: string;
	typ: LayerType;
	tileMatrixSet?: string;
	optionsFromCapabilities?: boolean;
	crs?: string;
	datasets?: Dataset[];
	layers?: string;
	featureType?: string;
	featureNS?: string;
	legend?: string | string[] | boolean;
	layerAttribution?: string;
	format?: string;
	version?: string;
	transparent?: boolean;
	singleTile?: boolean;
	infoFormat?: string;
	vtStyles?: VectorTileStyle[];
	preview?: {
		src: string;
	};
	styleId?: string;
	gfiAttributes?: string;
	visibility?: boolean;
	minScale?: number;
	maxScale?: number;
	cqlFilter?: string;
	styles?: string;
}

export interface VectorTileStyle {
	id: string;
	name: string;
	url: string;
	defaultStyle: boolean;
}

export interface LayerConfig {
	baselayer: {
		elements: LayerElement[];
	};
	subjectlayer: {
		elements: (LayerElement | LayerFolder)[];
	};
}

export interface LayerConfigItem {
	id: string;
	name: string;
	description?: string;
	question?: string;
	drawLayerId: string;
	visibleLayerIds: string[];
	canDrawPolygons?: boolean;
	canDrawBTF?: boolean;
	canDrawNotes?: boolean;
	legendSrc?: string;
	isIntro?: boolean;
	moduleNumber?: number;
	moduleName?: string;
	canQueryFeatures?: string[];
	featureDisplay?: "tooltip" | "modal";
}

export interface LayersState {
	layers: Map<string, ManagedLayer>;
	flattenedLayerElements: LayerElement[];
	layerConfig: LayerConfigItem[];
	drawLayerId: string | null;
	layerConfigId: string | null;
}

export interface LayersActions {
	setLayers: (layers: Map<string, ManagedLayer>) => void;
	setFlattenedLayerElements: (elements: LayerElement[]) => void;
	addLayer: (layer: ManagedLayer) => void;
	removeLayer: (layerId: string) => void;
	updateLayer: (
		layerId: string,
		updates: Partial<Omit<ManagedLayer, "id">>,
	) => void;
	setLayerVisibility: (layerId: string, visible: boolean) => void;
	setLayerStatus: (id: string, status: LayerStatus) => void;
	getLayerStatus: (id: string) => LayerStatus | undefined;
	setLayerConfig: (config: LayerConfigItem[]) => void;
	applyConfigLayers: (
		visibleLayerIds: string,
		hideOtherDrawLayers?: boolean,
	) => void;
	setDrawLayer: (layerId: string) => void;
	setLayerConfigId: (layerConfigId: string) => void;
	hideLayersByPattern: (pattern: string | string[]) => void;
}
