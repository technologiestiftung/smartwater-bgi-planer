# CLAUDE.md

Guidance for Claude Code when working in this repository.

# Rules for Claude

## General

- Read this file before making significant changes.
- Keep changes as small and focused as possible.
- Preserve existing coding style.
- Do not introduce new abstractions unless they clearly reduce complexity.
- Reuse existing functions before creating new ones.

## Safety

- Do not change API request or response formats unless explicitly requested.
- Do not rename endpoints without asking.
- Do not remove backwards compatibility unless instructed.
- Do not update Docker images or package versions unless requested.
- Do not change GitHub Actions workflows unless the task requires it.

## Documentation

- Whenever architecture changes, update this file.
- Keep documentation concise.
- Never invent missing information. Leave a TODO instead.

## Reviews

When reviewing code:

- Ignore formatting.
- Focus on bugs.
- Focus on edge cases.
- Focus on performance.
- Focus on security.
- Focus on API compatibility.
- Focus on maintainability.

## Before implementing

For larger changes:

1. Explain the proposed approach.
2. Point out possible risks.
3. Wait for confirmation before making structural changes.

Small bug fixes do not require confirmation.

## What this is

**BGI-Planer** ("Smart Water") is a map-based Next.js tool for Berlin planning staff to place
blue-green infrastructure (BGI) measures — green roofs, swales, unpaving, tree pits, etc. — on a
project area and see the modeled water-balance effect. Domain content (question text, layer
metadata, module steps) is German and climate-adaptation specific (Starkregen/heavy rain, heat,
sealing, water balance).

**Stack**: Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4, OpenLayers (`ol`),
Zustand, Node >= 24. No backend database — see Persistence below.

## Architecture

### Routing (`src/app`)

Everything lives under the dynamic `[id]` segment (the project id), laid out in
`src/app/[id]/layout.tsx` as a two-column shell: left is the routed step content, right is the
persistent `<Map>` + draw controls + address search. Sub-routes are the planning workflow steps,
each backed by a "Module" component:

- `/project-starter` → `ProjectStarterModule` (draw project boundary + new development)
- `/handlungsbedarfe` → `NeedForActionModule` ("need for action" assessment)
- `/machbarkeit` → `FeasibilityModule`
- `/planung` → `MeasurePlanningModule` (apply measures, run Rabimo)
- `/menu`, `/edit` → modal-only routes

`/[id]` itself just redirects to `/project-starter`. `@modal` is a parallel route with intercepting
segments (`(.)[id]`, `(.)new`) so `/new` and `/[id]/edit`/`/[id]/menu` render as modals over the
current map view instead of full navigations — don't "fix" these by flattening them into regular
pages. `ProjectGuard` (`src/components/ProjectGuard`) enforces that the routed `id` matches the
hydrated project in the store and redirects otherwise; it must wait for Zustand's `hasHydrated`
flag before deciding, so don't add logic upstream of that guard that assumes the project is
already loaded on first render.

### State (`src/store`)

Eight independent Zustand stores (`immer` + `devtools`, some with `persist`): `project`,
`scenario`, `layers`, `map`, `result`, `answers`, `files`, `ui`. Each is a folder with
`index.ts` (store creation), `actions.ts`, `types.ts`. Follow this split when adding state — don't
bolt new concerns onto an existing store's actions file if they're a distinct domain.

- `project` store: the drawn project boundary, input BTF features (`inputFeatures`, sourced from
  the `rabimo_input_2025` WFS layer), and derived stats. Persisted to `localStorage` under
  `project-storage` (partialized — computed/derived fields are excluded on purpose, see
  `partialize` in `src/store/project/index.ts`).
- `scenario` store: named scenarios, each holding the list of applied `Measure`s and
  `ConnectedArea`s (source areas routed into a measure, e.g. roof area connected to a swale).
- `layers`, `map`, `ui`: map/UI runtime state, generally not persisted.

### Persistence model (intentional, not a stopgap)

There is **no server-side project database and none is planned**. Project/scenario state lives
entirely in browser `localStorage` via Zustand `persist`. The only way to move a project between
browsers/machines is explicit export/import (`ProjectDownloadButton` → `ProjectExport.ts`, zipped
with `jszip`; `ProjectUploaderButton` for import). Do not introduce assumptions of a backend
project store, user accounts, or multi-device sync — that's out of scope for this app.

### Simulation (`src/lib/simulation`, `src/server/rabimo`)

Two distinct computation paths — don't conflate them:

1. **Client-side `simulationEngine`** (`areaCalculations.ts`, `measureCalculations.ts`): fast,
   synchronous area-balance math run in the browser for immediate UI feedback as the user adds/
   edits measures (e.g. `applyMeasures` recalculates sealed/unsealed/green-roof splits per BTF).
2. **External Rabimo API** (`src/server/rabimo/getRabimo.ts`, called from
   `src/app/api/rabimo/route.ts`): the authoritative water-balance model, a separate service
   reached via `API_URL` (server-only, `"use server"`/`"server-only"` — never call it from client
   code directly). `useRabimoPayload` builds the request from the active scenario's measures and
   project input features via `buildRabimoPayload`.

### Config-driven content (`src/config`, `src/components/Modules/modules.json`)

Map layers, question flows, module steps/measurements, and the measure catalog are data, not
markup:

- `src/config/layerConfig.json` — per-layer/question metadata (visible layers, draw layer, legend,
  German question/description text) keyed by an id referenced from `modules.json`.
- `src/components/Modules/modules.json` (+ `shared/moduleConfig.tsx` accessors) — module → step →
  measurement structure that drives the `VerticalStepper` UI.
- `src/config/measuresConfig.json` (+ `measuresConfig.ts`) — the measure catalog (parameters,
  scoring) keyed by `configId`.

**Rule: add new questions, layers, module steps, or user-facing text by extending these JSON
configs, not by hardcoding strings/props inside components.** Components should stay generic
renderers of config; if a component only makes sense for one hardcoded question, that's a sign the
config schema needs a new field instead.

### Map layers (`src/components/Map`)

`ConfigManager` and `LayerManager` translate `layerConfig.json` + `src/config/resources/*.json`
(WMS/WFS service definitions) into live OpenLayers layers. Custom projections (`EPSG:25833`,
`EPSG:3857`) are registered in `src/config/config.ts` via `proj4`. Draw interactions
(`src/components/DrawControls`) write into the `layers`/`project`/`scenario` stores depending on
what's being drawn (project boundary, new development, measures, notes, measurements).

## Conventions

- Tabs for indentation, double quotes, Prettier-enforced (`npm run format:fix`) — don't hand-format.
- ESLint config (`eslintRules.mjs`) enforces `prefer-const`, `eqeqeq`, no `else-return`, no param
  reassignment, `complexity` ≤ 10, `max-depth` ≤ 4 as warnings/errors — keep new code within these.
- Path alias `@/*` → `src/*`.
- Husky pre-commit/pre-push hooks run lint/format — don't bypass with `--no-verify`.

## Commands

```bash
npm run dev          # start dev server (localhost:3000)
npm run lint         # eslint --quiet
npm run lint:all     # eslint, all rules including warnings
npm run format:fix   # prettier --write
```

Requires `.env.local` with `MAPTILER_API_KEY`, `MAP_BOUNDING_BOX`, `SEARCH_FILTER_COUNTRY/CITY`,
and `API_URL` (Rabimo service) — see `.env.example`.

## If unsure

If project behaviour is unclear:

- Ask instead of guessing.
- Never fabricate requirements.
- Never silently change behaviour.
