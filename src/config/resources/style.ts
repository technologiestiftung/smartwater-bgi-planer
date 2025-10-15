const abimoStroke = {
	polygonStrokeWidth: 2,
	polygonStrokeColor: [84, 187, 168, 1],
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
					polygonStrokeWidth: 2,
					polygonStrokeColor: [84, 255, 255, 1],
					polygonFillColor: [84, 255, 255, 0.5],
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
					polygonStrokeColor: [255, 20, 20, 2],
					polygonFillColor: [255, 20, 20, 0.5],
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
		styleId: "module1Notes",
		rules: [
			{
				style: {
					pointFillColor: [255, 165, 0, 0.8],
					pointStrokeColor: [255, 140, 0, 1],
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
];

export default styleList;
