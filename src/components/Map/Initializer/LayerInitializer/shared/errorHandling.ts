import { ManagedLayer } from "@/store/layers/types";

interface LayerErrors {
	critical: string[];
	nonCritical: string[];
	hasBaseLayerError: boolean;
}

export const categorizeLayerErrors = (
	managedLayers: Map<string, ManagedLayer>,
	criticalIds: string[],
): LayerErrors => {
	const errors: LayerErrors = {
		critical: [],
		nonCritical: [],
		hasBaseLayerError: false,
	};

	managedLayers.forEach((layer) => {
		if (layer.status !== "error") return;

		if (layer.layerType === "base") {
			errors.hasBaseLayerError = true;
		} else if (criticalIds.includes(layer.id)) {
			errors.critical.push(layer.id);
		} else {
			errors.nonCritical.push(layer.id);
		}
	});

	return errors;
};

export const getErrorMessage = (
	errors: LayerErrors,
	baseLayers: ManagedLayer[],
	hasAnyLoadedBaseLayers: boolean,
): string => {
	if (!hasAnyLoadedBaseLayers && errors.hasBaseLayerError) {
		const firstBaseError = baseLayers.find((layer) => layer.error)?.error;
		return firstBaseError || "Hintergrundkarte konnte nicht geladen werden";
	}

	if (errors.critical.length > 0) {
		return `Kritische Layer konnten nicht geladen werden: ${errors.critical.join(", ")}`;
	}

	return "Karte konnte nicht vollständig geladen werden";
};
