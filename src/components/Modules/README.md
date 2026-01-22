# Module System

Diese README erklärt das Zusammenspiel der drei zentralen Konfigurationsdateien des Modulsystems.

## Dateien-Übersicht

### 1. `modules.json`

Definiert die **Struktur und Navigation** der Module.

```json
{
  "modules": [
    {
      "id": "needForAction",
      "order": 1,
      "title": "Modul 1: Handlungsbedarfe",
      "steps": [
        {
          "id": "heavyRain",
          "icon": "CloudRain",
          "title": "Starkregen",
          "questions": ["heavyRain_starter_question", "heavy_rain_flow_velocity", ...]
        }
      ]
    }
  ]
}
```

**Zweck:** Organisiert Module → Steps → Questions in einer hierarchischen Struktur.

### 2. `layerConfig.json` (`src/config/`)

Definiert für jede Question-ID die **Kartenkonfiguration und Interaktionen**.

```json
[
  {
    "id": "heavy_rain_flow_velocity",
    "name": "Fließgeschwindigkeit",
    "question": "Wo gibt es Bereiche...",
    "description": "Die Karte enthält...",
    "drawLayerId": "need_flooding_hotspots_q1",
    "canDrawPolygons": true,
    "canDrawBTF": true,
    "canDrawNotes": true,
    "visibleLayerIds": ["ua_srhk:da_fr_aussergewoehnlich", ...],
    "legendSrc": "/legends/1s1.svg"
  }
]
```

**Zweck:** Steuert für jede Frage, welche Layer sichtbar sind und welche Zeichenfunktionen verfügbar sind.

### 3. `config.json` (`src/config/`)

Definiert die **Kartenkonfiguration und alle verfügbaren Layer**.

```json
{
	"portalConfig": {
		"map": {
			/* Zoom, Extent, EPSG, etc. */
		}
	},
	"layerConfig": {
		"baselayer": {
			/* Basiskarten */
		},
		"subjectlayer": {
			"elements": [
				{ "id": "ua_srhk:da_fr_aussergewoehnlich", "visibility": false },
				{ "id": "project_boundary", "visibility": true }
			]
		}
	}
}
```

**Zweck:** Registriert alle Layer mit Standard-Sichtbarkeit und Map-Einstellungen.

## Zusammenspiel

```
User navigiert durch UI
        ↓
modules.json → Bestimmt verfügbare Module/Steps/Questions
        ↓
layerConfig.json → Lädt Konfiguration für aktuelle Question-ID
        ↓
config.json → Referenzierte Layer werden von der Map verwendet
        ↓
Map zeigt Layer + aktiviert Zeichenfunktionen
```

### Beispiel-Flow

1. User öffnet **Modul 1 → Starkregen → Fließgeschwindigkeit**
2. `modules.json`: Question-ID `"heavy_rain_flow_velocity"` wird geladen
3. `layerConfig.json`: Sucht Eintrag mit ID `"heavy_rain_flow_velocity"`
   - Aktiviert Layer: `["ua_srhk:da_fr_aussergewoehnlich", ...]`
   - Aktiviert Drawing auf: `"need_flooding_hotspots_q1"`
   - Zeigt Legend: `"/legends/1s1.svg"`
4. `config.json`: Stellt sicher, dass alle referenzierten Layer-IDs existieren
5. Map rendert die konfigurierten Layer und UI zeigt Zeichentools

## Wichtige Regeln

- **Question-IDs** in `modules.json` müssen mit IDs in `layerConfig.json` übereinstimmen
- **Layer-IDs** in `layerConfig.json` müssen in `config.json` definiert sein
- **Draw-Layer-IDs** müssen ebenfalls in `config.json` registriert sein
- Änderungen an der Modul-Struktur: `modules.json`
- Änderungen an Frage-Inhalten oder Layer-Zuordnungen: `layerConfig.json`
- Neue Layer hinzufügen: Erst in `config.json`, dann in `layerConfig.json` verwenden

## Datei-Standorte

- `src/components/Modules/modules.json` - Modul-Struktur
- `src/config/layerConfig.json` - Question-Layer-Mapping
- `src/config/config.json` - Map & Layer-Definitionen
