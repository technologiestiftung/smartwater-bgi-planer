import { useMapStore } from "@/store/map";

export const useMapReady = () => {
	return useMapStore((state) => state.isReady);
};

export const useMapState = () => {
	return useMapStore((state) => ({
		isReady: state.isReady,
		map: state.map,
	}));
};
