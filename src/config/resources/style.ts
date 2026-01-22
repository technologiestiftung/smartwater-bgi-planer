const abimoStroke = {
	polygonStrokeWidth: 2,
	polygonStrokeColor: [84, 187, 168, 1],
};

const resultStroke = {
	polygonStrokeWidth: 2,
	polygonStrokeColor: [36, 65, 209, 1], // default, can be overridden
};

const styleList = [
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
					polygonStrokeColor: [248, 237, 68, 1],
					polygonFillColor: [248, 237, 68, 0.3],
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
					polygonFillColor: [0, 119, 190, 0.5],
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
					polygonFillColor: [255, 87, 34, 0.5],
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
					polygonFillColor: [121, 85, 72, 0.5],
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
					polygonFillColor: [3, 169, 244, 0.5],
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
					polygonFillColor: [0, 150, 136, 0.5],
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
					polygonFillColor: [156, 39, 176, 0.4],
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
		styleId: "module1Notes",
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
		styleId: "module2Notes",
		rules: [
			{
				style: {
					pointFillColor: [156, 39, 176, 0.8],
					pointStrokeColor: [123, 31, 162, 1],
					pointStrokeWidth: 2,
				},
			},
		],
	},
	{
		styleId: "module3Notes",
		rules: [
			{
				style: {
					pointFillColor: [76, 175, 80, 0.8],
					pointStrokeColor: [56, 142, 60, 1],
					pointStrokeWidth: 2,
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
	// Conditional style for abimo_result_delta_w
	{
		styleId: "abimo_result_delta_w",
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
];

export default styleList;
