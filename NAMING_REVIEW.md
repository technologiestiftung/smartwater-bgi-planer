# Component Naming Review

A full review of naming conventions, export patterns, and structural consistency across the project.

---

## 1. File Name vs Export Name Mismatches

These are cases where the file is named one thing but the exported function/component has a different name:

| File                            | Exported Name                                      | Expected Name                                                |
| ------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| `MenuModal/MenuModal.tsx`       | `MenuModalWrapper`                                 | `MenuModal`                                                  |
| `ProjectModal/ProjectModal.tsx` | `ProjectModalWrapper`                              | `ProjectModal`                                               |
| `Modal/Modal.tsx`               | `Modal` — re-exported as `PageModal` in `index.ts` | Either rename the component to `PageModal` or drop the alias |

**Recommendation:** Rename `MenuModalWrapper` → `MenuModal` and `ProjectModalWrapper` → `ProjectModal`. If the "wrapper" distinction matters, name the files accordingly (`MenuModalWrapper.tsx`). For `PageModal`, pick one name and use it everywhere — right now the component is `Modal` internally but every consumer imports it as `PageModal`.

---

## 3. Export Style Inconsistency (Default vs Named)

The project mixes `export default` and named exports without a clear rule.

### Components using `export default`

- All **Map** sub-components (Map, BaselayerSwitch, ConfigManager, ClickControl, etc.)
- All **DrawControls** sub-components (DrawButton, DrawMeasureButton, etc.)
- All **FeatureDetailViews** sub-components
- `ProjectGuard`, `ProjectDownloadButton`, `ProjectUploaderButton`
- `ConfirmButton`
- Module root components (`FeasibilityModule`, `NeedForActionModule`, etc.)
- `MenuModalContent`, `MenuModule`

### Components using named exports

- All **Modal** components (Modal, ModalFooter, ModalHeader)
- All **SideMenu** components
- All **VerticalStepper** components
- All **ui/** (shadcn) components
- Module sub-components (`SynthesisView`, `SectionContent`, `MeasurePlaningAccordion`, etc.)
- `AddressSearch`, `FileUploadZone`, `MetricIconBadges`, `RichTextWithLinks`
- All hooks

### Mixed within the same folder

| Folder            | Default Exports                                      | Named Exports                                                                                             |
| ----------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Modules/shared/` | `StepContent`                                        | `ModuleStepper`, `ModuleFooter`, `SynthesisBadge`, `SynthesisView`, `useModuleNavigation`, `moduleConfig` |
| `ProjectModal/`   | `ProjectModalContent`, `ProjectModalWrapper`         | —                                                                                                         |
| `MenuModal/`      | `MenuModalWrapper`, `MenuModalContent`, `MenuModule` | —                                                                                                         |

**Recommendation:** Pick one approach and apply consistently. Named exports are generally preferred in modern codebases because they:

- Prevent accidental renaming on import
- Enable better auto-import support
- Are easier to search/refactor

---

## 5. Duplicate / Ambiguous Component Names

### `SynthesisView` — exists in 4 locations

| File                                             | Purpose                             |
| ------------------------------------------------ | ----------------------------------- |
| `Modules/shared/SynthesisView.tsx`               | Base/shared synthesis view          |
| `Modules/FeasibilityModule/SynthesisView.tsx`    | Feasibility-specific synthesis      |
| `Modules/NeedForActionModule/SynthesisView.tsx`  | Need-for-action-specific synthesis  |
| `Modules/MeasurePlaningModule/SynthesisView.tsx` | Measure planning-specific synthesis |

Since they are always imported by path, this works — but it can cause confusion. Consider prefixing: `FeasibilitySynthesisView`, `NeedForActionSynthesisView`, `MeasurePlanningSynthesisView`.

### `SectionContent` — exists in 2 locations

| File                                             |
| ------------------------------------------------ |
| `Modules/FeasibilityModule/SectionContent.tsx`   |
| `Modules/NeedForActionModule/SectionContent.tsx` |

Same situation as `SynthesisView`. Consider prefixing with the module name.

### `StepContent` — exists in 2 locations

| File                              |
| --------------------------------- |
| `Modules/shared/StepContent.tsx`  |
| `VerticalStepper/StepContent.tsx` |

These serve different purposes but share the same name. The shared module version wraps questions, while the VerticalStepper version renders step content by ID.

---

## 6. Hook Misplacement

| File                                                                       | Issue                                                                                                                         |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `lib/helpers/isStepValidUtil.ts`                                           | Exports `useStepValid()` — this is a React hook, not a utility. Should be in `hooks/` and renamed to `useStepValid.ts`.       |
| `components/ConfirmDialog/useConfirmDialog.tsx`                            | Hook lives inside a component folder — could be in `hooks/` for discoverability, or this is fine if scoped to that component. |
| `components/Modules/shared/useModuleNavigation.tsx`                        | Same pattern — hook scoped to module context. Acceptable.                                                                     |
| `components/Map/Initializer/LayerInitializer/hooks/useWmtsCapabilities.ts` | Hook in a nested `hooks/` subfolder. Fine — colocation pattern.                                                               |
| `components/UploadControls/hooks/useVectorUpload.ts`                       | Same colocation pattern. Fine.                                                                                                |
| `components/Map/LayerManager/hooks/useLayerPersistence.ts`                 | Same colocation pattern. Fine.                                                                                                |

**Recommendation:** Move `isStepValidUtil.ts` → `hooks/useStepValid.ts` (and rename the file). The colocation pattern (hooks next to their components) is fine for domain-specific hooks.

---

## 7. Folder Structure Observations

### Redundant single-file-in-folder pattern

Many folders contain only one file with the same name:

- `AddressSearch/AddressSearch.tsx`
- `ConfirmButton/ConfirmButton.tsx`
- `FileUpload/FileUploadZone.tsx`
- `MenuToggleButton/MenuToggleButton.tsx`
- `MetricIconBadges/MetricIconBadges.tsx`
- `ProjectDownloadButton/ProjectDownloadButton.tsx`
- `ProjectGuard/ProjectGuard.tsx`
- `ProjectUploaderButton/ProjectUploaderButton.tsx`
- `RichTextWithLinks/RichTextWithLinks.tsx`
- `Tutorials/Tutorial.tsx` (also note: folder is plural, file is singular)

**Assessment:** This is a common convention in React projects — allows adding tests, styles, or sub-components later. Not necessarily a problem, but if a folder only ever has one file, a flat structure is simpler.

### `Tutorials/` folder name vs `Tutorial.tsx` file name

The folder is plural (`Tutorials`) but contains a single component `Tutorial`. Either rename the folder to `Tutorial` or the component to `Tutorials`.

### `projectExport.ts` casing

In `ProjectDownloadButton/`, the utility file `projectExport.ts` uses camelCase while every other file in the project uses PascalCase for component-related files. Consider renaming to `ProjectExport.ts` or moving the utilities to `lib/helpers/`.

---

## 8. Index Files — Inconsistent Use

Some folders have barrel `index.ts` files, others don't:

| Folder                | Has `index.ts` |
| --------------------- | -------------- |
| `ConfirmDialog/`      | ✅             |
| `DrawControls/`       | ✅             |
| `Map/Controls/`       | ✅             |
| `Modal/`              | ✅             |
| `SideMenu/`           | ✅             |
| `VerticalStepper/`    | ✅             |
| `FeatureDetailViews/` | ❌             |
| `MenuModal/`          | ❌             |
| `ProjectModal/`       | ❌             |
| `Modules/`            | ❌             |
| `UploadControls/`     | ❌             |
| `Map/` (root)         | ❌             |

**Recommendation:** Either add barrel files to all multi-file folders or remove them from the ones that have them. Pick a consistent approach.

---

## Summary of Recommended Actions

### High Priority (bugs / confusion risk)

2. **Fix name mismatches:** `MenuModalWrapper` → `MenuModal`, `ProjectModalWrapper` → `ProjectModal` (or rename the files)
3. **Move misplaced hook:** `lib/helpers/isStepValidUtil.ts` → `hooks/useStepValid.ts`

### Medium Priority (consistency)

4. **Standardize export style:** Pick either named or default exports and apply consistently
5. **Resolve `Modal`/`PageModal` alias:** Use one name everywhere
6. **Disambiguate duplicate names:** Prefix `SynthesisView` and `SectionContent` with module names

### Low Priority (cleanup)

7. **Add or remove barrel `index.ts` files** consistently
8. **Fix `Tutorials/` folder** → `Tutorial/` (or rename the component)
9. **Fix `projectExport.ts` casing** → `ProjectExport.ts`
10. **Consider flattening** single-file component folders if you don't plan to add more files
