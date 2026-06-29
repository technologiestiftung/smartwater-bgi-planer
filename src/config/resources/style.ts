const abimoStroke = {
	polygonStrokeWidth: 2,
	polygonStrokeColor: [84, 187, 168, 1],
};

const resultStroke = {
	polygonStrokeWidth: 2,
	polygonStrokeColor: [36, 65, 209, 1], // default, can be overridden
};

export const styleList = [
	{
		styleId: "default",
		rules: [
			{
				style: {
					...abimoStroke,
					polygonFillColor: [0, 0, 0, 0],
				},
			},
		],
	},
	{
		styleId: "projectBoundary",
		rules: [
			{
				style: {
					polygonStrokeWidth: 6,
					polygonStrokeColor: [60, 188, 252, 1],
				},
			},
		],
	},
	{
		styleId: "newDevelopment",
		rules: [
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [64, 181, 255, 1],
					polygonFillColor: [64, 181, 255, 0.2],
				},
			},
		],
	},
	{
		styleId: "projectBTFPlanning",
		rules: [
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [0, 0, 0, 1],
					polygonFillColor: [0, 0, 0, 0],
				},
			},
		],
	},
	{
		styleId: "hotspots",
		rules: [
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [255, 20, 20, 1],
					polygonFillColor: [255, 20, 20, 0.5],
				},
			},
		],
	},
	{
		styleId: "floodingHotspots",
		rules: [
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [0, 119, 190, 1],
					polygonFillColor: [0, 119, 190, 0.3],
				},
			},
		],
	},
	{
		styleId: "temperatureHotspots",
		rules: [
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [255, 87, 34, 1],
					polygonFillColor: [255, 87, 34, 0.3],
				},
			},
		],
	},
	{
		styleId: "impermeabilityHotspots",
		rules: [
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [121, 85, 72, 1],
					polygonFillColor: [121, 85, 72, 0.3],
				},
			},
		],
	},
	{
		styleId: "waterbalanceHotspots",
		rules: [
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [3, 169, 244, 1],
					polygonFillColor: [3, 169, 244, 0.3],
				},
			},
		],
	},
	{
		styleId: "groundwaterHotspots",
		rules: [
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [0, 150, 136, 1],
					polygonFillColor: [0, 150, 136, 0.3],
				},
			},
		],
	},
	{
		styleId: "feasibilityLayers",
		rules: [
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [156, 39, 176, 1],
					polygonFillColor: [156, 39, 176, 0.3],
				},
			},
		],
	},
	{
		styleId: "measuresLayers",
		rules: [
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [76, 175, 80, 1],
					polygonFillColor: [76, 175, 80, 0.5],
				},
			},
		],
	},
	{
		styleId: "connectedArea",
		rules: [
			{
				conditions: {
					properties: {
						isUsed: true,
					},
				},
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [140, 120, 50, 1],
					polygonFillColor: [140, 120, 50, 0.25],
				},
			},
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [248, 237, 68, 1],
					polygonFillColor: [248, 237, 68, 0.5],
				},
			},
		],
	},
	{
		styleId: "projectNotes",
		rules: [
			{
				style: {
					pointFillColor: [255, 255, 255, 1],
					pointStrokeColor: [255, 255, 255, 1],
					pointStrokeWidth: 2,
					pointRadius: 14,
					iconScale: 0.8,
					icon: "/icons/note.svg",
				},
			},
		],
	},
	{
		styleId: "3V5",
		rules: [
			{
				conditions: {
					properties: {
						treeSize: "sm",
					},
				},
				style: {
					pointFillColor: [255, 134, 37, 1],
					pointStrokeColor: [255, 134, 37, 1],
					pointStrokeWidth: 2,
					pointRadius: 10,
					iconScale: 0.4,
					icon: "/icons/leaf.svg",
				},
			},
			{
				conditions: {
					properties: {
						treeSize: "md",
					},
				},
				style: {
					pointFillColor: [255, 134, 37, 1],
					pointStrokeColor: [255, 134, 37, 1],
					pointStrokeWidth: 2,
					pointRadius: 12,
					iconScale: 0.6,
					icon: "/icons/plant.svg",
				},
			},
			{
				conditions: {
					properties: {
						treeSize: "lg",
					},
				},
				style: {
					pointFillColor: [255, 134, 37, 1],
					pointStrokeColor: [255, 134, 37, 1],
					pointStrokeWidth: 2,
					pointRadius: 14,
					iconScale: 0.8,
					icon: "/icons/tree.svg",
				},
			},
			{
				style: {
					pointFillColor: [255, 134, 37, 1],
					pointStrokeColor: [255, 134, 37, 1],
					pointStrokeWidth: 2,
					pointRadius: 14,
					iconScale: 0.8,
				},
			},
		],
	},
	{
		styleId: "3B2",
		rules: [
			{
				conditions: {
					properties: {
						treeSize: "sm",
					},
				},
				style: {
					pointFillColor: [68, 156, 118, 1],
					pointStrokeColor: [68, 156, 118, 1],
					pointStrokeWidth: 2,
					pointRadius: 10,
					iconScale: 0.4,
					icon: "/icons/leaf.svg",
				},
			},
			{
				conditions: {
					properties: {
						treeSize: "md",
					},
				},
				style: {
					pointFillColor: [68, 156, 118, 1],
					pointStrokeColor: [68, 156, 118, 1],
					pointStrokeWidth: 2,
					pointRadius: 12,
					iconScale: 0.6,
					icon: "/icons/plant.svg",
				},
			},
			{
				conditions: {
					properties: {
						treeSize: "lg",
					},
				},
				style: {
					pointFillColor: [68, 156, 118, 1],
					pointStrokeColor: [68, 156, 118, 1],
					pointStrokeWidth: 2,
					pointRadius: 14,
					iconScale: 0.8,
					icon: "/icons/tree.svg",
				},
			},
			{
				style: {
					pointFillColor: [255, 255, 255, 1],
					pointStrokeColor: [255, 255, 255, 1],
					pointStrokeWidth: 2,
					pointRadius: 14,
					iconScale: 0.8,
				},
			},
		],
	},
	{
		styleId: "2v5",
		rules: [
			{
				conditions: { properties: { noteType: "schlecht" } },
				style: {
					iconScale: 0.8,
					icon: "/icons/warning.svg",
				},
			},
			{
				conditions: { properties: { noteType: "gut" } },
				style: {
					iconScale: 0.8,
					icon: "/icons/check.svg",
				},
			},
		],
	},
	{
		styleId: "3G1",
		rules: [
			{
				style: {
					polygonStrokeWidth: 4,
					polygonStrokeColor: [12, 76, 56, 1],
					polygonStrokeLineCap: "butt",
					polygonStrokeLineJoin: "miter",
					polygonFillColor: [200, 236, 217, 0.5],
				},
			},
		],
	},
	{
		styleId: "3G2",
		rules: [
			{
				style: {
					polygonStrokeWidth: 4,
					polygonStrokeColor: [12, 76, 56, 1],
					polygonStrokeLineDash: [8],
					polygonStrokeLineCap: "butt",
					polygonStrokeLineJoin: "miter",
					polygonFillColor: [200, 236, 217, 0.5],
				},
			},
		],
	},
	{
		styleId: "3G5",
		rules: [
			{
				style: {
					polygonStrokeWidth: 4,
					polygonStrokeColor: [68, 156, 118, 1],
					polygonStrokeLineCap: "butt",
					polygonStrokeLineJoin: "miter",
				},
			},
		],
	},
	{
		styleId: "3E2",
		rules: [
			{
				style: {
					polygonStrokeWidth: 4,
					polygonStrokeColor: [246, 27, 54, 1],
					polygonStrokeLineCap: "butt",
					polygonStrokeLineJoin: "miter",
					polygonFillColor: [246, 27, 54, 0.1],
				},
			},
		],
	},
	{
		styleId: "3E1",
		rules: [
			{
				style: {
					polygonStrokeWidth: 4,
					polygonStrokeColor: [246, 27, 54, 1],
					polygonStrokeLineDash: [8],
					polygonStrokeLineCap: "butt",
					polygonStrokeLineJoin: "miter",
				},
			},
		],
	},
	{
		styleId: "3B1",
		rules: [
			{
				style: {
					polygonFillColor: [73, 222, 128, 0.5],
					polygonStrokeColor: [73, 222, 128, 0.5],
				},
			},
		],
	},
	{
		styleId: "3V1",
		rules: [
			{
				style: {
					polygonFillColor: [255, 134, 37, 0.3],
					polygonStrokeColor: [255, 134, 37, 0.3],
				},
			},
		],
	},
	{
		styleId: "3V2",
		rules: [
			{
				style: {
					polygonStrokeWidth: 4,
					polygonStrokeColor: [255, 134, 37, 1],
					polygonStrokeLineCap: "butt",
					polygonStrokeLineJoin: "miter",
					polygonFillColor: [255, 134, 37, 0.3],
				},
			},
		],
	},
	{
		styleId: "3V3",
		rules: [
			{
				style: {
					polygonStrokeWidth: 4,
					polygonStrokeColor: [255, 134, 37, 1],
					polygonStrokeLineDash: [8],
					polygonStrokeLineCap: "butt",
					polygonStrokeLineJoin: "miter",
					polygonFillColor: [255, 134, 37, 0.3],
				},
			},
		],
	},
	{
		styleId: "3V4",
		rules: [
			{
				style: {
					polygonStrokeWidth: 4,
					polygonStrokeColor: [255, 134, 37, 1],
					polygonStrokeLineCap: "butt",
					polygonStrokeLineJoin: "miter",
				},
			},
		],
	},
	{
		styleId: "3V6",
		rules: [
			{
				style: {
					polygonStrokeWidth: 4,
					polygonStrokeColor: [255, 134, 37, 1],
					polygonStrokeLineDash: [8],
					polygonStrokeLineCap: "butt",
					polygonStrokeLineJoin: "miter",
				},
			},
		],
	},
	{
		styleId: "3S1",
		rules: [
			{
				style: {
					polygonFillColor: [56, 175, 255, 0.3],
					polygonStrokeColor: [56, 175, 255, 0.3],
				},
			},
		],
	},
	{
		styleId: "3S2",
		rules: [
			{
				style: {
					polygonFillColor: [56, 175, 255, 1],
					polygonStrokeColor: [56, 175, 255, 1],
				},
			},
		],
	},
	{
		styleId: "3S4",
		rules: [
			{
				style: {
					polygonStrokeWidth: 4,
					polygonStrokeColor: [56, 175, 255, 1],
					polygonStrokeLineCap: "butt",
					polygonStrokeLineJoin: "miter",
				},
			},
		],
	},
	{
		styleId: "3S5",
		rules: [
			{
				style: {
					polygonStrokeWidth: 4,
					polygonStrokeColor: [56, 175, 255, 1],
					polygonStrokeLineDash: [8],
					polygonStrokeLineCap: "butt",
					polygonStrokeLineJoin: "miter",
				},
			},
		],
	},
	{
		styleId: "measuresSeepage",
		rules: [
			{
				style: {
					polygonStrokeWidth: 2,
					polygonStrokeColor: [84, 255, 50, 1],
					polygonFillColor: [84, 255, 50, 0.5],
				},
			},
		],
	},
	{
		styleId: "abimoInput",
		rules: [
			{
				style: {
					polygonStrokeWidth: 1,
					polygonStrokeColor: [0, 0, 0, 0.3],
					polygonFillColor: [0, 0, 0, 0],
				},
			},
		],
	},
	// Conditional style for result_delta_w
	{
		styleId: "result_delta_w",
		rules: [
			{
				conditions: {
					properties: {
						delta_w: [0, 20],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [36, 65, 209, 1],
				},
			},
			{
				conditions: {
					properties: {
						delta_w: [20, 40],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [127, 148, 247, 1],
				},
			},
			{
				conditions: {
					properties: {
						delta_w: [40, 60],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [240, 151, 130, 1],
				},
			},
			{
				conditions: {
					properties: {
						delta_w: [60, 80],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [203, 78, 90, 1],
				},
			},
			{
				conditions: {
					properties: {
						delta_w: [80, 100],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [138, 26, 39, 1],
				},
			},
		],
	},
	{
		styleId: "result_infiltr",
		rules: [
			{
				conditions: {
					properties: {
						infiltr: [-400, 0],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [255, 255, 255, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [0, 60],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [220, 250, 240, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [60, 80],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [190, 240, 220, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [80, 100],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [150, 230, 200, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [100, 120],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [120, 220, 180, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [120, 140],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [90, 210, 160, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [140, 160],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [60, 200, 140, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [160, 180],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [40, 180, 120, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [180, 200],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [20, 160, 100, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [200, 220],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [10, 140, 80, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [220, 240],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [10, 120, 70, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [240, 260],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [10, 100, 50, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [260, 280],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [10, 80, 40, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [280, 300],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [0, 60, 30, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [300, 400],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [0, 50, 20, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [400, 500],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [0, 30, 10, 1],
				},
			},
			{
				conditions: {
					properties: {
						infiltr: [500, 800],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [0, 0, 0, 1],
				},
			},
		],
	},
	{
		styleId: "result_evapor",
		rules: [
			{
				conditions: {
					properties: {
						evapor: [0, 50],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [255, 255, 255, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [50, 100],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [220, 240, 255, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [100, 120],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [180, 210, 255, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [120, 140],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [140, 190, 255, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [140, 160],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [100, 170, 255, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [160, 180],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [70, 150, 240, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [180, 200],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [50, 130, 220, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [200, 220],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [30, 110, 210, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [220, 240],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [20, 90, 200, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [240, 260],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [10, 70, 180, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [260, 280],
					},
				},
				style: {
					polygonFillColor: [10, 60, 160, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [280, 300],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [0, 50, 140, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [300, 400],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [0, 40, 100, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [400, 500],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [0, 20, 80, 1],
				},
			},
			{
				conditions: {
					properties: {
						evapor: [500, 800],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [0, 0, 50, 1],
				},
			},
		],
	},
	{
		styleId: "result_runoff",
		rules: [
			{
				conditions: {
					properties: {
						runoff: [0, 50],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [255, 255, 255, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [50, 100],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [255, 230, 230, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [100, 150],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [255, 200, 200, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [150, 200],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [255, 170, 170, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [200, 250],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [255, 140, 140, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [250, 270],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [240, 110, 110, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [270, 290],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [230, 90, 90, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [290, 310],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [220, 70, 70, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [310, 330],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [210, 50, 50, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [330, 350],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [200, 40, 40, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [350, 370],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [180, 30, 30, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [370, 390],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [160, 20, 20, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [390, 410],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [140, 10, 10, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [410, 450],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [100, 0, 0, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [450, 500],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [80, 0, 0, 1],
				},
			},
			{
				conditions: {
					properties: {
						runoff: [500, 800],
					},
				},
				style: {
					...resultStroke,
					polygonFillColor: [50, 0, 0, 1],
				},
			},
		],
	},
];
