# Configuration Files Overview

This directory contains all configuration files for the BGI-Planer application. Here's how they connect and work together:

## File Structure

```
config/
├── config.json           # Global map configuration
├── layerConfig.json      # Layer configuration items (questions/views)
├── modules.json          # Module and section structure
├── resources/
│   ├── services.json     # Layer definitions (WMS, WFS, GEOJSON, etc.)
│   └── style.ts          # OpenLayers style definitions
└── README.md            # This file
```

## Configuration Flow & Mapping

### 1. **modules.json** → Structure Definition

Defines the **hierarchical structure** of modules and sections.

```json
{
  "id": "needs_analysis",
  "label": "Bedarfsanalyse",
  "sections": [
    {
      "id": "flooding",
      "label": "Starkregen",
      "icon": "🌧️",
      "color": "blue",
      "questionIds": ["module_1_question_1", "module_1_question_2", ...]
    }
  ]
}
```

**Purpose:**

- Organizes questions into modules and sections
- Provides display metadata (labels, icons, colors)
- Acts as the **single source of truth** for structure

**Used by:** `SynthesisHotspotTest` component

---

### 2. **layerConfig.json** → Question/View Configuration

Defines **individual questions/views** with their layer associations.

```json
{
  "id": "module_1_question_1",
  "name": "Fließgeschwindigkeit",
  "description": "...",
  "drawLayerId": "need_flooding_hotspots_q1",
  "visibleLayerIds": ["ua_srhk:da_fr_aussergewoehnlich", ...]
}
```

**Purpose:**

- Maps questions to draw layers (where users draw)
- Maps questions to visible background layers (WMS/WFS data to display)
- Provides question text and descriptions

**Used by:**

- `LayerConfigTest` component
- `SynthesisHotspotTest` component (via `modules.json` mapping)
- Layer visibility management

---

### 3. **resources/services.json** → Layer Definitions

Defines **all map layers** available in the application.

```json
{
  "id": "need_flooding_hotspots_q1",
  "name": "Starkregen Hotspots Q1",
  "typ": "GEOJSON",
  "styleId": "floodingHotspots",
  ...
}
```

**Purpose:**

- Technical layer definitions (URLs, types, CRS)
- Links layers to style definitions via `styleId`
- Configures WMS, WFS, WMTS, GEOJSON layers

**Used by:** Layer initialization system

---

### 4. **resources/style.ts** → Visual Styles

Defines **OpenLayers styles** for how layers are rendered.

```typescript
floodingHotspots: {
	style: new Style({
		fill: new Fill({ color: "rgba(59, 130, 246, 0.2)" }),
		stroke: new Stroke({ color: "#3b82f6", width: 2 }),
	});
}
```

**Purpose:**

- Visual appearance of layers
- Different styles for different categories (flooding, temperature, etc.)

**Used by:** Layer rendering, draw interactions

---

## How They Connect

```
┌─────────────────┐
│  modules.json   │  Defines structure & questionIds
└────────┬────────┘
         │
         ├──► ["module_1_question_1", "module_1_question_2", ...]
         │
         ▼
┌─────────────────┐
│layerConfig.json │  Maps questionIds → drawLayerId + visibleLayerIds
└────────┬────────┘
         │
         ├──► drawLayerId: "need_flooding_hotspots_q1"
         ├──► visibleLayerIds: ["ua_srhk:da_fr_aussergewoehnlich", ...]
         │
         ▼
┌─────────────────┐
│services.json    │  Defines layer properties + styleId
└────────┬────────┘
         │
         ├──► styleId: "floodingHotspots"
         │
         ▼
┌─────────────────┐
│   style.ts      │  Visual rendering
└─────────────────┘
```

## Example: Complete Flow

**User opens "Fließgeschwindigkeit" question:**

1. **modules.json** → Section "flooding" contains `questionIds: ["module_1_question_1"]`
2. **layerConfig.json** → `module_1_question_1` has:
   - `drawLayerId: "need_flooding_hotspots_q1"` (where to draw)
   - `visibleLayerIds: ["ua_srhk:da_fr_aussergewoehnlich"]` (what to show)
3. **services.json** → Layer `need_flooding_hotspots_q1` has:
   - `typ: "GEOJSON"` (vector layer)
   - `styleId: "floodingHotspots"` (visual style)
4. **style.ts** → Style `floodingHotspots` defines blue polygons

## Adding New Content

### Add a new question:

1. Add question config to `layerConfig.json`
2. Add draw layer to `services.json` (if needed)
3. Add question ID to appropriate section in `modules.json`

### Add a new section:

1. Add section to `modules.json` with `questionIds`
2. Ensure questions exist in `layerConfig.json`

### Add a new module:

1. Add module to `modules.json` with sections
2. Questions already in `layerConfig.json` can be referenced

## Key Design Principles

- **modules.json** = Structure (HOW things are organized)
- **layerConfig.json** = Content (WHAT questions/layers exist)
- **services.json** = Technical (HOW layers are loaded)
- **style.ts** = Presentation (HOW layers look)

This separation allows:

- ✅ Reorganizing structure without touching layer definitions
- ✅ Reusing questions across multiple modules
- ✅ Updating styles without changing configuration
- ✅ Adding new layers without restructuring modules
