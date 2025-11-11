# Map Architektur - BGI Planer

Diese Dokumentation erklärt die Zusammenarbeit zwischen den verschiedenen Komponenten und Konfigurationsdateien im Map-System.

## 📋 Übersicht der Komponenten

### Core Komponenten

- **`MapInitializer`** - Initialisierung der Kartenkonfiguration und Layer-Daten
- **`LayerInitializer`** - Erstellung und Verwaltung der OpenLayers Layer-Instanzen
- **`Map.tsx`** - Haupt-Map-Komponente mit OpenLayers-Integration

### Konfigurationsdateien

- **`config.json`** - Haupt-Kartenkonfiguration (Projektionen, Zoom-Level, Extent)
- **`layerConfig.json`** - Layer-spezifische Konfiguration und Strukturierung
- **`services.json`** - Service-Definitionen (WMTS, WMS, etc.) für alle verfügbaren Layer

---

## 🔄 Datenfluss & Funktionsweise

```
config.json + layerConfig.json + services.json
                    ↓
            MapInitializer
                    ↓
    Zustand wird in Stores gespeichert
                    ↓
            LayerInitializer
                    ↓
   OpenLayers Layer werden erstellt
                    ↓
           Map.tsx rendert die Karte
```

---

## 🔧 MapInitializer

**Zweck:** Lädt und verarbeitet die Konfigurationsdateien und bereitet sie für die Verwendung vor.

**Was passiert:**

1. **Lade Konfigurationen:** Importiert `config.json`, `layerConfig.json` und `services.json`
2. **Service-Mapping:** Erstellt eine Map zur schnellen Service-Zuordnung über IDs
3. **Layer-Anreicherung:** Verbindet Layer-Definitionen mit ihren Service-Konfigurationen
4. **Store-Update:** Speichert verarbeitete Daten in Zustand-Stores

**Eingabe:**

```json
// Beispiel aus config.json
{
	"layerConfig": {
		"baselayer": {
			"elements": [
				{
					"id": "basemap_raster_grau",
					"visibility": true
				}
			]
		}
	}
}
```

**Ausgabe:** Angereicherte Layer-Objekte mit Service-Informationen und Status

---

## 🏗️ LayerInitializer

**Zweck:** Erstellt echte OpenLayers Layer-Instanzen basierend auf den Service-Konfigurationen.

**Unterstützte Layer-Typen:**

- **WMTS** - Web Map Tile Service (mit Capabilities-Parsing)
- **WMS** - Web Map Service (Tile und Image Varianten)
- **GeoJSON** - Vektordaten
- **VectorTiles** - Mapbox-Style Vektorkacheln

**Prozess:**

1. **Capabilities laden:** Für WMTS-Services werden Capabilities-Dokumente geladen
2. **Layer erstellen:** Je nach Service-Typ werden passende OpenLayers-Layer erstellt
3. **Style anwenden:** Styling wird auf Vektorlayer angewendet
4. **Fehlerbehandlung:** Fehlerhafte Layer werden als solche markiert

---

## 📁 Konfigurationsdateien im Detail

### config.json

```json
{
  "portalConfig": {
    "map": {
      "mapView": {
        "startCenter": [389920, 5819697],  // Startposition
        "epsg": "EPSG:25833",             // Koordinatensystem
        "startZoomLevel": 4,              // Anfangs-Zoomlevel
        "options": [...]                  // Zoom-Level Definitionen
      }
    }
  },
  "layerConfig": {
    "baselayer": { ... },               // Grundkarten
    "subjectlayer": { ... }             // Themenlayer
  }
}
```

### services.json

```json
[
	{
		"id": "basemap_raster_grau",
		"typ": "WMTS",
		"url": "https://...",
		"capabilitiesUrl": "https://...",
		"layers": "topplus_web_grau",
		"tileMatrixSet": "EPSG:25833"
	}
]
```

### layerConfig.json

```json
[
	{
		"id": "temperatureHotspots",
		"name": "Temperatur Hotspots",
		"drawLayerId": "project_boundary",
		"visibleLayerIds": [
			"rabimo_input_2025",
			"project_btf_planning",
			"project_boundary"
		]
	}
]
```

---

## 🗂️ Store-System

**Layer Store:**

- `flattenedLayerElements` - Alle verfügbaren Layer (flach)
- `layerConfig` - Layer-spezifische Konfiguration
- `layers` - OpenLayers Layer-Instanzen mit Status

**Map Store:**

- `config` - Verarbeitete Kartenkonfiguration
- `map` - OpenLayers Map-Instanz
- `mapReady` - Status der Karteninitialisierung

---

## 🚀 Initialisierungsreihenfolge

1. **MapInitializer** lädt und verarbeitet Konfigurationsdateien
2. **Store** wird mit verarbeiteten Daten befüllt
3. **LayerInitializer** erstellt OpenLayers Layer-Instanzen
4. **Map-Komponente** rendert die finale Karte

---

## 💡 Wichtige Konzepte

- **Layer-ID Mapping:** Services werden über IDs mit Layer-Definitionen verknüpft
- **Lazy Loading:** WMTS Capabilities werden nur bei Bedarf geladen
- **Fehlerbehandlung:** Defekte Layer blockieren nicht die gesamte Karte
- **Caching:** Server-seitige Zwischenspeicherung von Capabilities-Dokumenten
- **Flattening:** Verschachtelte Layer-Strukturen werden für einfachere Verarbeitung flach gemacht
