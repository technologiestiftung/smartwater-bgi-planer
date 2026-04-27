import type { MeasureDimension, MeasureSize, MeasureType } from "./types";

const MEASURE_DIMENSIONS: Record<
	MeasureType,
	Record<MeasureSize, MeasureDimension>
> = {
	greenRoof: {
		small: { length: 5, width: 4, height: 0.1, area: 20 },
		medium: { length: 12.5, width: 8, height: 0.1, area: 100 },
		large: { length: 25, width: 10, height: 0.1, area: 250 },
	},
	unpaved: {
		small: { length: 2, width: 5, area: 10 },
		medium: { length: 25, width: 2, area: 50 },
		large: { length: 50, width: 10, area: 500 },
	},
	swale: {
		small: {
			length: 10,
			width: 1,
			depth: 0.3,
			area: 10,
			volume: 3,
			connectedArea: 50,
		},
		medium: {
			length: 10,
			width: 5,
			depth: 0.3,
			area: 50,
			volume: 30,
			connectedArea: 250,
		},
		large: {
			length: 20,
			width: 10,
			depth: 0.3,
			area: 200,
			volume: 150,
			connectedArea: 1000,
		},
	},
};

const constants = {
	MEASURE_DIMENSIONS,
};

export default constants;
