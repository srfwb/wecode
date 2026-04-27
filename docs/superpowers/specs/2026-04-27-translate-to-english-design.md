# Translate WeCode to English — Design Spec

## Context

WeCode currently has all UI strings in French. The decision is to switch the entire app to English — UI labels, error messages, editor hints, lesson content, changelog, and internal type values. No i18n library; strings stay hardcoded, just in English instead of French.

## Scope

~150 French strings across ~30 files. Grouped by domain:

### 1. Types (internal values)

- `LessonData.difficulty`: `"débutant" | "intermédiaire" | "avancé"` → `"beginner" | "intermediate" | "advanced"` (in `src/lessons/types.ts` + both JSON files)
- `HomeTab`: `"accueil"` → `"home"` (in `src/home/homeStore.ts` + all consumers: `HomeNav.tsx`, `HomeShell.tsx`, `CommandPalette.tsx`, `useCommandPaletteShortcut.ts`)
- `PALETTE_GROUP_LABELS`: French labels → English (in `src/palette/types.ts`)

### 2. Editor hints (`src/ide/editor/hints.ts`)

~50 entries with `kindLabel`, `title`, `body`, and `example` fields. All French bodies/titles to English. `kindLabel` values like `"Élément HTML"` → `"HTML Element"`, `"Propriété CSS"` → `"CSS Property"`.

### 3. Lesson JSON files (`src/lessons/data/`)

- `html-01-structure.json`: title, description, heading, paragraphs, checkpoint labels
- `challenge-01-simple-page.json`: same fields

### 4. Changelog (`src/changelog.md`)

Entire file rewritten in English. Section headings `Ajouté / Amélioré / Corrigé` → `Added / Changed / Fixed`. All bullet points translated.

### 5. Home components (`src/home/`)

| File                        | French strings                     |
| --------------------------- | ---------------------------------- |
| `HomeNav.tsx`               | "Accueil", "Leçons" labels         |
| `HomeRailFoot.tsx`          | "Nouveautés de la", "Docs et aide" |
| `HomeSearch.tsx`            | placeholder, aria-label            |
| `ContinueCard.tsx`          | eyebrow, meta text, buttons        |
| `ContinueLessonCard.tsx`    | eyebrow, subtitle, button          |
| `ContinueSection.tsx`       | heading, empty state               |
| `RecentProjectsSection.tsx` | heading, empty state, context menu |
| `ChangelogModal.tsx`        | title, close button                |
| `LessonCard.tsx`            | status badges, time label          |
| `LessonsListView.tsx`       | heading                            |
| `ChallengesListView.tsx`    | heading                            |

### 6. IDE shell components (`src/ide/`)

| File                   | French strings                                        |
| ---------------------- | ----------------------------------------------------- |
| `Toolbar.tsx`          | aria-labels, placeholder, tooltips                    |
| `StatusBar.tsx`        | (reads from statusBarFormat)                          |
| `statusBarFormat.ts`   | "Texte", "Sauvegarde auto", "Sauvegardé il y a..."    |
| `ConfirmDialog.tsx`    | default confirm/cancel labels                         |
| `Toasts.tsx`           | aria-label                                            |
| `FileTree.tsx`         | labels, aria-labels, modal titles, context menu items |
| `LessonDock.tsx`       | "Leçon"/"Challenge", "points", hint footer            |
| `OpenFilesTabs.tsx`    | empty state, aria-label                               |
| `fileErrorMessages.ts` | all 8 error messages                                  |

### 7. Project modals (`src/projects/ui/`)

| File                      | French strings                                   |
| ------------------------- | ------------------------------------------------ |
| `CreateProjectModal.tsx`  | title, field labels, placeholder, toast, buttons |
| `DeleteProjectDialog.tsx` | title, body, checkbox, warning, toast, buttons   |
| `RenameProjectModal.tsx`  | title, body, label, toast, buttons               |

### 8. Palette (`src/palette/`)

| File                 | French strings                                     |
| -------------------- | -------------------------------------------------- |
| `CommandPalette.tsx` | aria-label, placeholder, empty state, footer hints |
| `commands.ts`        | command title/subtitle                             |
| `sources.ts`         | pill labels, lesson placeholder toast              |

### 9. Other

- `src/projects/actions.ts` — error message "Un projet avec ce nom existe déjà"
- `src/projects/paths.ts` — validation messages
- `src/projects/diskAutoSave.ts` — toast message
- `src/lessons/lessonStore.ts` — (no direct French, reads from JSON)

### 10. Tests to update

- `src/ide/shell/fileErrorMessages.test.ts` — French assertions → English
- `src/ide/shell/statusBarFormat.test.ts` — French format strings → English
- `src/home/HomeShell.test.tsx` — French text matchers → English
- `src/palette/CommandPalette.test.tsx` — French text matchers → English

### 11. CLAUDE.md update

- `"UI strings are in French"` → `"UI strings are in English"`
- Changelog convention: mention both files are now in English

## What does NOT change

- `CHANGELOG.md` (root) — already in English
- `README.md` — already in English
- Git conventions (commits, PR bodies, branches) — already in English
- Code identifiers — already in English
- CSS class names — already in English
- Rust backend error messages — already in English

## Verification

```bash
npm run typecheck   # type changes (difficulty, HomeTab) compile
npm run lint
npm run test        # updated test assertions pass
npm run format:check
npm run build
grep -rn "Sauvegard\|Rechercher\|Nouveau\|Supprimer\|Renommer\|Annuler\|Confirmer\|Leçon\|débutant\|Reprends\|Fichiers\|fichier\|dossier\|Accueil" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".test."
# Should return 0 hits (no French left in source, excluding test context)
```
