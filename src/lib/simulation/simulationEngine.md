# Simulation Engine Rundown

## Purpose

The simulation layer turns project input features and selected measures into three things:

1. area statistics for the current status quo
2. measure statistics for the planned interventions
3. a report payload with formatted values for the UI or export

The main entry point is `simulationEngine` in `src/lib/simulation/simulationEngine.ts`.

## Current Structure

- `simulationEngine.ts`
  Orchestrates the main calculation steps.
- `types.ts`
  Holds all shared simulation types.
- `constants.ts`
  Holds measure presets and the empty fallback stats.
- `calculations/areaCalculations.ts`
  Computes area-based base stats and weighted result stats.
- `calculations/measureCalculations.ts`
  Computes the effect of selected measures on the base area setup.
- `calculations/reportPayload.ts`
  Converts raw stats into a display-ready report payload.

## High-Level Flow

```mermaid
flowchart TD
		A[InputFeature[] from project store] --> B[simulationEngine.preprocessInput]
		B --> C[areaCalculations.calculateAllStats]
		C --> D[AccumulatedAbimoStats / AreaStats]

		E[Measure[] from scenario] --> F[simulationEngine.applyMeasures]
		A --> F
		F --> G[measureCalculations.calculateAllMeasureStats]
		G --> H[MeasureStats]

		I[ResultItem[] from ABIMO or later simulation step] --> J[simulationEngine.computeResults]
		J --> K[areaCalculations.calculateResultStats]
		K --> L[ResultStats]

		D --> M[simulationEngine.buildReportPayload]
		H --> M
		L --> M
		N[AreaType[]] --> M
		O[Baseline / preComputedStats] --> M
		M --> P[reportPayload.getReportPayload]
		P --> Q[ReportPayload]
```

## What The Engine Does

### `preprocessInput(inputFeatures, newUnpvd?)`

This is the status quo step.

It:

- extracts the raw OpenLayers features from `InputFeature[]`
- reads the feature attributes like `total_area`, `roof`, `pvd`, `green_roof`, `to_swale`
- calculates base area stats with `areaCalculations.calculateAllStats(...)`

Output:

- `AccumulatedAbimoStats`
- this is the base state before any measure is applied

### `applyMeasures(inputFeatures, measures)`

This is the planning step.

It:

- returns `EMPTY_MEASURE_STATS` if there are no input features or no measures
- enriches each measure with preset dimensions from `constants.ts`
- groups measures by type: `greenRoof`, `unpaved`, `swale`
- calculates how much new area / volume / connected area those measures add

Output:

- `MeasureStats`
- this is the planned intervention result on top of the base data

### `computeResults(resultData)`

This is the weighted result step.

It:

- takes simulation result rows (`ResultItem[]`)
- computes area-weighted averages for:
  - `deltaW`
  - `runoff`
  - `evaporation`
  - `infiltration`

Output:

- `ResultStats`

### `buildReportPayload(...)`

This is the formatting step.

It:

- combines base area stats, measure stats, result stats and area type config
- calculates final display values for status quo and simulation
- formats values as strings for report usage, for example `123 m² (45.67 %)`

Output:

- `ReportPayload`

## What The Calculations Mean

## 1. Area Calculations

File: `calculations/areaCalculations.ts`

This file works on the raw input polygons and their stored fractions.

### Totals

- `getTotalArea`
  Sum of all `total_area`
- `getTotalRoofArea`
  Sum of `total_area * roof`
- `getTotalGreenRoofArea`
  Sum of `total_area * roof * green_roof`
- `getTotalPavedArea`
  Sum of `total_area * pvd`
- `getTotalUnpavedArea`
  `totalArea - roofArea - pavedArea`
- `getTotalSwaleConnectedArea`
  Sum of `total_area * roof * pvd * to_swale` according to the current implementation
- `getTotalSealedArea`
  `roofArea + pavedArea`

### Means

These divide a total by the overall area.

- `meanRoof`
- `meanGreenRoof`
- `meanPaved`
- `meanUnpaved`
- `meanSwaleConnected`

### Max values

These describe theoretical upper bounds from the current base state.

- `maxGreenRoof`
  Currently equal to `meanRoof`
- `maxUnpaved`
  `1 - meanRoof`
- `maxUnpavedArea`
  `maxUnpaved * totalArea`
- `maxSwaleConnected`
  Limited by the smaller of:
  - paved share derived from current mean unpaved area
  - paved share derived from `newUnpvd` if provided
- `maxSwaleConnectedArea`
  `maxSwaleConnected * totalArea`

### `calculateAllStats(...)`

This is the main base-area aggregation.

It returns:

- total values
- mean values
- max values
- ratios like:
  - `maxGreenRoofToRoof`
  - `maxSwaleConnectedToPvd`

### `calculateResultStats(...)`

This is separate from polygon area calculations.

It uses area-weighted averages across result rows to get one combined result for the whole selection.

## 2. Measure Calculations

File: `calculations/measureCalculations.ts`

This file translates selected measures into updated planning stats.

### Step A: Enrich measure presets

Each measure gets dimensions from `constants.ts`.

Examples:

- green roof presets provide `area` and `height`
- swale presets provide `area`, `depth`, `volume`, `connectedArea`

### Step B: Split by measure type

The measures are grouped into:

- green roof measures
- unpaved measures
- swale measures

### Step C: Compute planning effect

The file then calculates three planning blocks.

#### Green roof

- existing green roof area: `Ag_0`
- maximum possible green roof area: `Ag_max`
- new green roof area after measures: `Ag_neu`
- fraction of total area: `newGreenRoof`
- percentage relative to roof area: `newGreenRoofToRoof`

#### Unpaved

- existing unpaved area: `Ae_0`
- maximum possible unpaved area: `Ae_max`
- new unpaved area after measures: `Ae_neu`
- new unpaved fraction: `newUnpvd`
- resulting paved share after unsealing: `pvd_neu`

#### Swale

- existing swale-connected area: `Am_0`
- maximum possible swale-connected area: `Am_max`
- new connected area after measures: `Am_neu`
- resulting fraction: `newToSwale`

### `calculateAllMeasureStats(...)`

This is the main planning aggregation.

It returns:

- number of measures by type
- total planned measure areas / volumes
- updated fractions used later in the report payload
- intermediate values like `Ag_*`, `Ae_*`, `Am_*`

## 3. Report Payload Calculations

File: `calculations/reportPayload.ts`

This file turns raw stats into report-ready output.

### `calculateBaseAreas(...)`

Builds a normalized base object for reporting:

- total area
- roof / paved / unpaved ratios
- target percentages
- derived areas like `roofArea`, `targetUnpavedArea`, `targetPavedArea`

### `calculateMeasurePlanningValues(...)`

Chooses which percentages to show:

- without measure planning: use target values
- with measure planning: use `MeasureStats` values like `newGreenRoof`, `newUnpvd`, `newToSwale`

### `calculateAbimoValues(...)`

Builds two comparable result blocks:

- `result`
  simulation result values and percentages
- `statusQuo`
  baseline values and formatted strings

### `formatSurfaceAreas(...)`

Formats the area distribution for:

- roof
- green roof
- paved
- unpaved

for both:

- status quo
- simulation

### `getReportPayload(...)`

This is the final formatter.

It returns one `ReportPayload` object that contains:

- `surfaceAreas`
- `measures`
- `waterBalanceStatusQuo`
- `abimoResult`

## Constants

File: `constants.ts`

This file currently provides two things:

- `MEASURE_DIMENSIONS`
  predefined measure presets for `greenRoof`, `unpaved`, `swale`
- `EMPTY_MEASURE_STATS`
  zero / null fallback used when no measure calculation can be performed

## Important Current Limitation

The current `simulationEngine` is an orchestrator facade. It does not yet execute a full end-to-end ABIMO run itself.

Right now it provides four main steps:

- `preprocessInput`
- `applyMeasures`
- `computeResults`
- `buildReportPayload`

So the actual result row input for `computeResults` still needs to come from somewhere else.

## Short Mental Model

If you want one sentence for the whole module:

`simulationEngine` takes base polygons, derives the current area situation, applies planned measures conceptually, aggregates simulation result rows, and formats everything into one report-ready structure.
