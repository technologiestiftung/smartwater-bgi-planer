# Map Initialisierung

## Überblick

Die Map-Initialisierung erfolgt in drei koordinierten Schritten über separate Komponenten.

## Initialisierungsfluss (Graphisch)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Store Hydration (Zustand Persist)                         │
│    - Lädt persistierten State aus localStorage               │
│    - Setzt hasHydrated = true                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. MapInitializer (Einstiegspunkt)                           │
│    Wartet auf: hasHydrated = true                            │
│    Guard: configVersion tracking                             │
│                                                               │
│    Aktion:                                                    │
│    • Lädt config.json + layerConfig.json                     │
│    • Enriched Layer mit services.json                        │
│    • Flattened verschachtelte Layer-Strukturen              │
│    • Setzt enriched Config im Store                          │
│                                                               │
│    Output: isConfigReady = true ✓                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. OlMap                                                      │
│    Wartet auf: isConfigReady = true                          │
│    Guard: configVersion tracking                             │
│                                                               │
│    Aktion:                                                    │
│    • Erstellt OpenLayers Map-Instanz                         │
│    • Konfiguriert View (Projection, Extent, Resolutions)     │
│    • Bindet an DOM-Element (mapId.current)                   │
│    • Registriert im Store: populateMap(map)                  │
│                                                               │
│    Output: map instance ✓                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. LayerInitializer                                           │
│    Wartet auf: map + initialConfig + capabilitiesLoaded      │
│    Guard: configVersion tracking                             │
│                                                               │
│    Aktion:                                                    │
│    • WMTS Capabilities laden (parallel)                      │
│    • Erstellt OL-Layer via createLayerByType()               │
│    • Setzt Z-Index (Base: 0+, Subject: 100+, Draw: 1000+)   │
│    • Fügt Layer zur Map hinzu: map.addLayer()                │
│    • Registriert im Store: setLayers(Map<id, ManagedLayer>)  │
│    • Prüft Base-Layer Status                                 │
│                                                               │
│    Output: mapReady = true ✓ (oder hasError)                │
└─────────────────────────────────────────────────────────────┘
```

### Reinitialisierung (Config Upload/Delete)

```
┌──────────────────────────────────────┐
│ Trigger: Config Upload oder Delete   │
│                                       │
│ • reinitializeConfig(newConfig)       │
│   oder                                │
│ • resetMapState()                     │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Store Action (Atomare Operationen)   │
│                                       │
│ 1. configVersion++ (FIRST!)          │
│ 2. isConfigReady = false (IMMEDIATE) │
│ 3. Map cleanup: setTarget(undefined) │
│ 4. Clear config/initialConfig        │
│ 5. Set new config (if upload)        │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Alle Initializer detektieren Change  │
│                                       │
│ if (lastConfigVersion !== configVersion) {
│   // OlMap: cleanup & removeMap()    │
│   // MapInitializer: clear layers    │
│   // LayerInitializer: remove layers │
│   hasInitialized.current = false     │
│ }                                     │
└──────────────┬───────────────────────┘
               │
               ▼
       Neuer Durchlauf ↻

Key Principle: configVersion++ und
isConfigReady=false ZUERST setzen,
dann cleanup, dann neue Werte.
```

## Initialisierungsablauf

### 1. MapInitializer

**Wann**: Nach Zustand-Hydration (`hasHydrated`)  
**Was**:

- Lädt `config.json` und `layerConfig.json`
- Enriched Layer-Elemente mit Service-Definitionen aus `services.json`
- Flattened verschachtelte Layer-Strukturen
- Setzt `isConfigReady = true` im Store

**Guard**: `hasInitialized` Ref verhindert Mehrfachausführung

### 2. OlMap

**Wann**: Nach `isConfigReady`  
**Was**:

- Erstellt OpenLayers Map-Instanz mit View-Config (Projektionen, Resolutions, Extent)
- Registriert Map im Store via `populateMap()`
- Target: DOM-Element `mapId.current`

**Guard**: `hasInitialized` Ref verhindert Mehrfachausführung

### 3. LayerInitializer

**Wann**: Nach `map` + `initialConfig` + `isConfigReady` + `capabilitiesLoaded`  
**Was**:

- Erstellt OL-Layer pro `flattenedLayerElements` via `createLayerByType()`
- Setzt Z-Index (Base: 0+, Subject: 100+, Draw: 1000+)
- Registriert Layer im `useLayersStore`
- Prüft Base-Layer Status → setzt `mapReady` oder `hasError`

**Guard**:

- `hasInitialized` Ref verhindert Mehrfachausführung
- **`isConfigReady` Check**: Verhindert Verwendung von stale Layer-Daten

## Store-Status

### useMapStore

- `config`: Enriched Map-Config
- `initialConfig`: Ursprüngliche Config (für Reset)
- `isConfigReady`: Config geladen und verarbeitet
- `map`: OpenLayers Map-Instanz
- `mapReady`: Map + Base-Layer erfolgreich geladen
- `hasError`: Fehler beim Laden

### useLayersStore

- `flattenedLayerElements`: Alle Layer-Configs (flach)
- `layerConfig`: Layer-Metadaten aus `layerConfig.json`
- `layers`: Map<layerId, ManagedLayer> mit OL-Instanzen

## Fehlerbehandlung

- Base-Layer-Fehler → `mapReady = false` + `hasError = true`
- Einzelne Layer-Fehler → Status `"error"` im ManagedLayer
- WMTS-Capabilities-Fehler → gecached und weiterverarbeitet

## Config neu laden / Reset

### Implementierung: configVersion Counter

**Store State:**

- `configVersion: number` in `useMapStore` (startet bei 0)
- Wird bei jedem Config-Reload inkrementiert

**Mechanismus:**
Alle drei Initializer tracken `configVersion`:

```typescript
const lastConfigVersion = useRef(configVersion);

useEffect(() => {
	if (lastConfigVersion.current !== configVersion) {
		hasInitialized.current = false;
		lastConfigVersion.current = configVersion;
		// LayerInitializer: cleanup existing layers
	}
	// ... rest of initialization
}, [...dependencies, configVersion]);
```

**Usage:**

1. **Config hochladen:**

   ```typescript
   useMapStore.getState().reinitializeConfig(newConfig);
   ```

   - **Inkrementiert `configVersion` ZUERST**
   - **Setzt `isConfigReady = false` SOFORT**
   - Cleaned up bestehende Map (setTarget(undefined))
   - Cleared alte Config-Daten
   - Setzt neue Config
   - Triggert Reinitialisierung aller drei Komponenten

2. **Projekt löschen:**

   ```typescript
   useMapStore.getState().resetMapState();
   ```

   - **Setzt `isConfigReady = false` SOFORT**
   - Cleaned up bestehende Map
   - Kompletter Reset auf initialState
   - `configVersion` zurück auf 0

**Race Condition Prevention:**

- `configVersion` und `isConfigReady` werden ZUERST gesetzt
- Dadurch erkennen alle Komponenten sofort den Change
- Cleanup erfolgt synchron bevor neue Initialisierung
- Alle Komponenten warten auf `isConfigReady = true`
