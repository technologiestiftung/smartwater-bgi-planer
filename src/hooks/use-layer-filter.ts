"use client";

import { useLayersStore } from "@/store/layers";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

export function useLayerFilter(
	originalId: string,
	filterId: string,
	filterFn: (feature: any) => boolean,
) {
	const { createFilteredLayer, setLayerVisibility } = useLayersStore(
		useShallow((state) => ({
			createFilteredLayer: state.createFilteredLayer,
			setLayerVisibility: state.setLayerVisibility,
		})),
	);
	const filterFnRef = useRef(filterFn);

	useEffect(() => {
		filterFnRef.current = filterFn;
	}, [filterFn]);

	useEffect(() => {
		const state = useLayersStore.getState();
		const originalLayer = state.layers.get(originalId);
		const wasVisible = originalLayer?.visibility ?? false;

		createFilteredLayer(originalId, filterFnRef.current, filterId);

		setLayerVisibility(originalId, false);
		if (wasVisible) {
			setLayerVisibility(filterId, true);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [originalId, filterId]);
}
