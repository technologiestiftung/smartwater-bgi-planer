"use client";

import {
	// useAnswersStore,
	// useFilesStore,
	// useLayersStore,
	// useMapStore,
	useProjectStore,
	useResultStore,
	useScenarioStore,
	// useUiStore,
} from "@/store";
import { FC, useEffect } from "react";

interface StoreGuardProps {}

const StoreGuard: FC<StoreGuardProps> = ({}) => {
	useEffect(() => {
		const stores = [
			// { name: "answers", store: useAnswersStore },
			// { name: "files", store: useFilesStore },
			// { name: "layers", store: useLayersStore },
			// { name: "map", store: useMapStore },
			{ name: "project", store: useProjectStore },
			{ name: "result", store: useResultStore },
			{ name: "scenario", store: useScenarioStore },
			// { name: "ui", store: useUiStore },
		];

		const unsubscribers = stores.map(({ name, store }) =>
			store.subscribe((state) => {
				console.log(`[StoreGuard] ${name}`, state);
			}),
		);

		return () => {
			unsubscribers.forEach((unsubscribe) => unsubscribe());
		};
	}, []);

	return null;
};

export default StoreGuard;
