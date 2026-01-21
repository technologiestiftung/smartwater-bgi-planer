import { getLayerIdsInFolder } from "@/lib/helpers/ol";
import { LayersState, ManagedLayer } from "@/store/layers/types";
import { MapConfig } from "@/store/map/types";
import { LayerStatus } from "@/types/shared";

type SetState = (fn: (state: LayersState) => Partial<LayersState>) => void;
type GetState = () => LayersState;

export const createSetLayerStatus =
	(set: SetState, get: GetState) => (id: string, status: LayerStatus) => {
		const currentLayersMap = get().layers;
		const layerToUpdate = currentLayersMap.get(id);

		if (layerToUpdate) {
			const updatedLayersMap = new Map(currentLayersMap);
			updatedLayersMap.set(id, { ...layerToUpdate, status });

			set(() => ({ layers: updatedLayersMap }));
		} else {
			console.warn(
				`[layerActions] Layer with id ${id} not found for status update.`,
			);
		}
	};

export const createGetLayerStatus =
	(get: GetState) =>
	(id: string): LayerStatus | undefined => {
		const currentLayersMap = get().layers;
		const layer = currentLayersMap.get(id);

		return layer?.status;
	};

export const createAddLayer = (set: SetState) => (layer: ManagedLayer) =>
	set((state) => {
		const newLayers = new Map(state.layers);
		newLayers.set(layer.id, layer);
		return { layers: newLayers };
	});

export const createRemoveLayer = (set: SetState) => (layerId: string) =>
	set((state) => {
		const newLayers = new Map(state.layers);
		newLayers.delete(layerId);
		return { layers: newLayers };
	});

export const createUpdateLayer =
	(set: SetState) => (layerId: string, updates: Partial<ManagedLayer>) =>
		set((state) => {
			const newLayers = new Map(state.layers);
			const layerToUpdate = newLayers.get(layerId);
			if (layerToUpdate) {
				newLayers.set(layerId, { ...layerToUpdate, ...updates });
			}
			return { layers: newLayers };
		});

export const createSetLayerVisibility =
	(set: SetState, get: GetState) => (layerId: string, visible: boolean) => {
		const currentLayersMap = get().layers;
		const layerToUpdate = currentLayersMap.get(layerId);
		if (layerToUpdate) {
			if (layerToUpdate.olLayer) {
				layerToUpdate.olLayer.setVisible(visible);
			}
			const updatedLayersMap = new Map(currentLayersMap);
			updatedLayersMap.set(layerId, { ...layerToUpdate, visibility: visible });
			set(() => ({ layers: updatedLayersMap }));
		}
	};

export const createApplyConfigLayers =
	({
		set,
		get,
		getMapConfig,
		getMapReady,
	}: {
		set: SetState;
		get: GetState;
		getMapConfig: () => MapConfig | null;
		getMapReady: () => boolean;
	}) =>
	(visibleLayerIds: string, hideOtherDrawLayers = false) => {
		const state = get();
		const currentMapLayers = state.layers;
		const layerConfigItem = state.layerConfig.find(
			(item) => item.id === visibleLayerIds,
		);

		if (!layerConfigItem) {
			console.warn(`Layer config item with id ${visibleLayerIds} not found`);
			return;
		}

		const isMapReady = getMapReady();

		if (!isMapReady) {
			return;
		}

		// Get map config through callback for proper cross-store communication
		const mapConfig = getMapConfig();

		if (!mapConfig) {
			console.warn(
				"Map config not available. Applying basic layer visibility.",
			);
			// Fallback: just turn on the requested layers without turning off others
			set(() => ({
				drawLayerId: layerConfigItem.drawLayerId,
				layerConfigId: layerConfigItem.id,
			}));

			const newLayersMap = new Map(currentMapLayers);
			layerConfigItem.visibleLayerIds.forEach((layerId) => {
				const layer = newLayersMap.get(layerId);
				if (layer && layer.olLayer && !layer.visibility) {
					layer.olLayer.setVisible(true);
					newLayersMap.set(layerId, { ...layer, visibility: true });
				}
			});

			set(() => ({ layers: newLayersMap }));
			return;
		}

		set(() => ({
			drawLayerId: layerConfigItem.drawLayerId,
			layerConfigId: layerConfigItem.id,
		}));

		const folderElements = mapConfig.layerConfig.subjectlayer.elements;
		const thememapsLayerIds = getLayerIdsInFolder(folderElements, "Thememaps");

		const drawLayerIds = getLayerIdsInFolder(folderElements, "Draw Layers");

		const newLayersMap = new Map(currentMapLayers);

		// Only turn off layers that are in the Thememaps folder
		thememapsLayerIds.forEach((layerId) => {
			const layer = newLayersMap.get(layerId);
			if (layer && layer.olLayer && layer.visibility) {
				layer.olLayer.setVisible(false);
				newLayersMap.set(layerId, { ...layer, visibility: false });
			}
		});

		// Hide other draw layers if requested
		if (hideOtherDrawLayers) {
			const keepVisibleDrawLayers = new Set([
				"project_boundary",
				"project_new_development",
				"module1_notes",
			]);

			if (layerConfigItem.drawLayerId) {
				keepVisibleDrawLayers.add(layerConfigItem.drawLayerId);
			}

			drawLayerIds.forEach((layerId) => {
				if (!keepVisibleDrawLayers.has(layerId)) {
					const layer = newLayersMap.get(layerId);
					if (layer && layer.olLayer) {
						layer.olLayer.setVisible(false);
						newLayersMap.set(layerId, { ...layer, visibility: false });
					}
				}
			});
		}

		layerConfigItem.visibleLayerIds.forEach((layerId) => {
			const layer = newLayersMap.get(layerId);
			if (layer && layer.olLayer) {
				layer.olLayer.setVisible(true);
				newLayersMap.set(layerId, { ...layer, visibility: true });
			}
		});

		// Ensure the current draw layer is visible if it exists
		if (layerConfigItem.drawLayerId) {
			const drawLayer = newLayersMap.get(layerConfigItem.drawLayerId);
			if (drawLayer && drawLayer.olLayer) {
				drawLayer.olLayer.setVisible(true);
				newLayersMap.set(layerConfigItem.drawLayerId, {
					...drawLayer,
					visibility: true,
				});
			}
		}

		set(() => ({ layers: newLayersMap }));
	};

export const createHideLayersByPattern =
	(set: SetState, get: GetState) =>
	(pattern: string | string[]): void => {
		const patterns = Array.isArray(pattern) ? pattern : [pattern];
		const currentLayersMap = get().layers;
		const newLayersMap = new Map(currentLayersMap);
		let hasChanges = false;

		Array.from(currentLayersMap.values()).forEach((layer) => {
			const matchesPattern = patterns.some((p) => layer.id.includes(p));

			if (matchesPattern && layer.visibility) {
				if (layer.olLayer) {
					layer.olLayer.setVisible(false);
				}
				newLayersMap.set(layer.id, { ...layer, visibility: false });
				hasChanges = true;
			}
		});

		if (hasChanges) {
			set(() => ({ layers: newLayersMap }));
		}
	};

export const createFilteredLayer =
	(set: SetState, get: GetState) =>
	(
		layerId: string,
		filterFn: (feature: any) => boolean,
		filteredLayerId?: string,
	): string | null => {
		const { useMapStore } = require("@/store/map");
		const map = useMapStore.getState().map;
		if (!map) return null;

		const layers = get().layers;
		const originalLayer = layers.get(layerId);
		if (!originalLayer || !originalLayer.olLayer) return null;

		const originalOlLayer = originalLayer.olLayer as any;
		const source = originalOlLayer.getSource?.();
		if (!source) return null;

		// Features filtern
		const allFeatures = source.getFeatures();
		const filteredFeatures = allFeatures.filter(filterFn);

		// Neuen Layer mit gefilterten Features erstellen
		const VectorSource = require("ol/source/Vector").default;
		const VectorLayer = require("ol/layer/Vector").default;

		const newSource = new VectorSource({
			features: filteredFeatures,
		});

		const newLayer = new VectorLayer({
			source: newSource,
			style: originalOlLayer.getStyle?.(),
			zIndex: originalLayer.zIndex,
		});

		const newLayerId = filteredLayerId || `${layerId}_filtered`;
		newLayer.set("id", newLayerId);
		newLayer.setVisible(true);

		// Layer zur Karte hinzufügen
		map.addLayer(newLayer);

		// Im Store registrieren
		const managedLayer: ManagedLayer = {
			id: newLayerId,
			config: {
				id: newLayerId,
				name: `${originalLayer.config.name || layerId} (gefiltert)`,
				visibility: true,
				status: "loaded",
				elements: [],
			},
			olLayer: newLayer,
			status: "loaded",
			visibility: true,
			opacity: originalLayer.opacity,
			zIndex: originalLayer.zIndex,
			layerType: originalLayer.layerType,
		};

		set((state) => {
			const newLayers = new Map(state.layers);
			newLayers.set(newLayerId, managedLayer);
			return { layers: newLayers };
		});

		return newLayerId;
	};

export const createUpdateFilteredLayer =
	(set: SetState, get: GetState) =>
	(
		originalLayerId: string,
		filterFn: (feature: any) => boolean,
		filteredLayerId?: string,
	): void => {
		const { useMapStore } = require("@/store/map");
		const map = useMapStore.getState().map;
		if (!map) return;

		const layers = get().layers;
		const originalLayer = layers.get(originalLayerId);
		if (!originalLayer || !originalLayer.olLayer) return;

		const targetFilteredLayerId =
			filteredLayerId || `${originalLayerId}_filtered`;
		const filteredLayer = layers.get(targetFilteredLayerId);
		if (!filteredLayer || !filteredLayer.olLayer) return;

		const originalOlLayer = originalLayer.olLayer as any;
		const source = originalOlLayer.getSource?.();
		if (!source) return;

		// Features neu filtern
		const allFeatures = source.getFeatures();
		const filteredFeatures = allFeatures.filter(filterFn);

		// Source des gefilterten Layers aktualisieren
		const filteredOlLayer = filteredLayer.olLayer as any;
		const filteredSource = filteredOlLayer.getSource?.();
		if (filteredSource) {
			filteredSource.clear();
			filteredSource.addFeatures(filteredFeatures);
		}
	};

export const createRemoveFilteredLayer =
	(set: SetState, get: GetState) =>
	(filteredLayerId: string): void => {
		const { useMapStore } = require("@/store/map");
		const map = useMapStore.getState().map;
		if (!map) return;

		const layers = get().layers;
		const layer = layers.get(filteredLayerId);
		if (layer?.olLayer) {
			map.removeLayer(layer.olLayer);
		}

		set((state) => {
			const newLayers = new Map(state.layers);
			newLayers.delete(filteredLayerId);
			return { layers: newLayers };
		});
	};
