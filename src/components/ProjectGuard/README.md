# ProjectGuard & useProjectsStore - BGI Planer

Diese Dokumentation erklärt die Funktionsweise des ProjectGuard und wie Projekte im useProjectsStore gespeichert und verwaltet werden.

## 📋 Übersicht

### Komponenten

- **`ProjectGuard`** - Schutz-Komponente für projektspezifische Routes
- **`useProjectsStore`** - Zustand-Store für Projektverwaltung

### Zweck

Der ProjectGuard stellt sicher, dass nur gültige Projekt-IDs in der URL verwendet werden und leitet bei Inkonsistenzen automatisch um.

---

## 🔄 Datenfluss & Funktionsweise

```
URL: /[projectId]
        ↓
   ProjectGuard prüft
        ↓
useProjectsStore.getProject()
        ↓
    Projekt gefunden?
   ↙️              ↘️
JA                NEIN
↓                  ↓
ID stimmt überein? Redirect zu "/"
↙️        ↘️
JA        NEIN
↓         ↓
Rendern   Redirect zu korrekter ID
```

---

## 🛡️ ProjectGuard

**Zweck:** Validiert Projekt-URLs und stellt konsistente Navigation sicher.

### Funktionsweise

```tsx
<ProjectGuard projectId={id}>{/* Projektspezifischer Inhalt */}</ProjectGuard>
```

### Ablauf der Validierung

1. **Mount-Status prüfen:** Wartet auf Client-seitige Hydration
2. **Store-Hydration prüfen:** Wartet bis Zustand aus localStorage geladen ist
3. **Projekt-Validierung:**
   - Projekt im Store vorhanden? ❌ → Redirect zu `/`
   - Projekt-ID stimmt mit URL überein? ❌ → Redirect zu korrekter ID
   - Alles OK? ✅ → Rendert Children

### Hydration-Problem lösen

```tsx
const [mounted, setMounted] = useState(false);
const { hasHydrated } = useProjectsStore();

// Verhindert SSR/Client Mismatch
if (!mounted || !hasHydrated) {
	return <>{children}</>;
}
```

---

## 🗄️ useProjectsStore

**Zweck:** Zentrale Projektverwaltung mit localStorage-Persistierung.

### Store-Struktur

```typescript
interface ProjectsState {
	project: Project | null; // Aktuelles Projekt
	hasHydrated: boolean; // Hydration-Status
}

interface Project {
	id: string; // Eindeutige ID
	name: string; // Projektname
	description: string; // Beschreibung
	useCase: UseCase; // Anwendungsfall
	createdAt: number; // Erstellungszeitpunkt
	updatedAt: number; // Letzte Änderung
}
```

### Verfügbare Aktionen

| Aktion            | Beschreibung              | Verwendung                       |
| ----------------- | ------------------------- | -------------------------------- |
| `createProject()` | Erstellt neues Projekt    | Projekt-Wizard                   |
| `updateProject()` | Aktualisiert Projektdaten | Settings/Bearbeitung             |
| `deleteProject()` | Löscht Projekt + Dateien  | Projekt löschen                  |
| `getProject()`    | Holt aktuelles Projekt    | Überall wo Projektdaten benötigt |

---

## 💾 Persistierung & Hydration

### localStorage Integration

```typescript
persist(
	(set, get) => ({
		/* Store Logic */
	}),
	{
		name: "projects-storage", // localStorage Key
		onRehydrateStorage: () => (state) => {
			state?.setHasHydrated(true); // Hydration-Flag setzen
		},
	},
);
```

### Hydration-Lifecycle

1. **Server-Render:** `hasHydrated = false`
2. **Client-Mount:** Store lädt Daten aus localStorage
3. **Hydration Complete:** `hasHydrated = true`
4. **Component Ready:** ProjectGuard kann validieren

---

## 🔧 Projekt-Aktionen im Detail

### Projekt erstellen

```typescript
const createProject = (project: Omit<Project, "createdAt" | "updatedAt">) => {
	const now = Date.now();
	const newProject: Project = {
		...project,
		createdAt: now,
		updatedAt: now,
	};
	set(() => ({ project: newProject }));
};
```

### Projekt aktualisieren

```typescript
const updateProject = (updates: Partial<Project>) => {
	set(() => ({
		project: {
			...currentProject,
			...updates,
			updatedAt: Date.now(), // Auto-Update Timestamp
		},
	}));
};
```

### Projekt löschen

```typescript
const deleteProject = async () => {
	const projectId = state.project?.id;
	set(() => ({ project: null }));

	// Lösche auch verknüpfte Dateien
	if (projectId) {
		await useFilesStore.getState().deleteProjectFiles(projectId);
	}
};
```

---

## 🚨 Sicherheits-Mechanismen

### 1. **URL-Validierung**

```tsx
// Prüft ob URL-Parameter mit Store-Projekt übereinstimmt
if (project.id !== projectId) {
	router.replace(`/${project.id}`);
}
```

### 2. **Null-State Handling**

```tsx
// Leitet zu Startseite wenn kein Projekt vorhanden
if (!project) {
	router.replace("/");
}
```

### 3. **Hydration-Schutz**

```tsx
// Verhindert fehlerhafte Renders vor Hydration
if (!mounted || !hasHydrated) {
	return <>{children}</>;
}
```

---

## 📱 Verwendung in der App

### Layout-Integration

```tsx
// app/[id]/layout.tsx
export default async function ProjectLayout({ params }) {
	const { id } = await params;

	return (
		<ProjectGuard projectId={id}>
			<div>{/* Projektspezifischer Inhalt */}</div>
		</ProjectGuard>
	);
}
```

### Store-Zugriff in Komponenten

```tsx
function MyComponent() {
	const project = useProjectsStore((state) => state.getProject());
	const updateProject = useProjectsStore((state) => state.updateProject);

	// Projekt verwenden...
}
```

---

## 🔍 Use Cases

| Anwendungsfall      | Beschreibung                        |
| ------------------- | ----------------------------------- |
| **Individual area** | Einzelne Fläche                     |
| **District**        | Stadtteil                           |
| **Property**        | Grundstück                          |
| **PublicSpace**     | Straßen, Wege, Plätze / Grünflächen |

---

## 💡 Wichtige Konzepte

- **Single Project Store:** Pro Session nur ein aktives Projekt
- **Automatic Redirects:** URL wird automatisch korrigiert bei Inkonsistenzen
- **Hydration Safety:** Schutz vor SSR/Client-Mismatches
- **File Integration:** Projektlöschung bereinigt auch verknüpfte Dateien
- **Timestamp Tracking:** Automatische createdAt/updatedAt Verwaltung
