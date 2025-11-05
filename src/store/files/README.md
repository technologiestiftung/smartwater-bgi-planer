# Files Store

A dedicated Zustand store for managing layer files in IndexedDB, separate from the main project state which uses localStorage.

## Architecture

- **File metadata**: Stored in localStorage (projectId, layerId, uploadedAt)
- **File blobs**: Stored in IndexedDB (efficient binary storage)
- **Key format**: `{projectId}:{layerId}` for each file

## Usage

### Adding a file

```typescript
import { useFilesStore } from "@/store/files";

const addFile = useFilesStore((state) => state.addFile);

// Add a file for a specific layer
await addFile("project-123", "project_boundary", file);
```

### Getting a file

```typescript
const getFile = useFilesStore((state) => state.getFile);

const layerFile = getFile("project-123", "project_boundary");
if (layerFile) {
	console.log(layerFile.file); // File blob
	console.log(layerFile.uploadedAt); // Timestamp
}
```

### Deleting a file

```typescript
const deleteFile = useFilesStore((state) => state.deleteFile);

await deleteFile("project-123", "project_boundary");
```

### Getting all files for a project

```typescript
const getAllProjectFiles = useFilesStore((state) => state.getAllProjectFiles);

const files = getAllProjectFiles("project-123");
files.forEach((layerFile) => {
	console.log(`Layer ${layerFile.layerId}: ${layerFile.file.name}`);
});
```

### Deleting all files for a project

```typescript
const deleteProjectFiles = useFilesStore((state) => state.deleteProjectFiles);

// This is automatically called when a project is deleted
await deleteProjectFiles("project-123");
```

## Layer IDs

Layer IDs come from the config file at `src/config/config.json`. Each draw layer element has an `id` field:

```json
{
	"layerConfig": {
		"subjectlayer": {
			"elements": [
				{
					"name": "Draw Layers",
					"type": "folder",
					"elements": [
						{ "id": "project_boundary", "visibility": true },
						{ "id": "project_btf_planning", "visibility": true },
						{ "id": "module1_notes", "visibility": true }
					]
				}
			]
		}
	}
}
```

## Example: Complete workflow

```typescript
import { useProjectsStore } from "@/store/projects";
import { useFilesStore } from "@/store/files";

// Create a project
const createProject = useProjectsStore((state) => state.createProject);
createProject({
	id: "project-123",
	name: "My Project",
	description: "A test project",
	useCase: UseCase.District,
});

// Add files for different layers
const addFile = useFilesStore((state) => state.addFile);
await addFile("project-123", "project_boundary", boundaryFile);
await addFile("project-123", "project_btf_planning", planningFile);
await addFile("project-123", "module1_notes", notesFile);

// Get all files for the project
const getAllProjectFiles = useFilesStore((state) => state.getAllProjectFiles);
const files = getAllProjectFiles("project-123");
console.log(`Project has ${files.length} files`);

// Delete the project (automatically cleans up files)
const deleteProject = useProjectsStore((state) => state.deleteProject);
await deleteProject(); // Files are automatically deleted
```

## Storage Limits

- **localStorage**: ~5-10 MB (used for metadata only)
- **IndexedDB**: Much larger (typically 50MB+, can be GBs depending on browser)

This architecture ensures file blobs don't consume localStorage space and can scale to larger files.
