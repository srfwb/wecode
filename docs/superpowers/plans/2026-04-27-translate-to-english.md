# Translate WeCode to English — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every French UI string in WeCode with its English equivalent, including internal type values, lesson content, editor hints, and the in-app changelog.

**Architecture:** No i18n library. Strings stay hardcoded. File-by-file replacement grouped by domain. Type unions that use French values (`"débutant"`, `"accueil"`) are renamed to English equivalents. Tests updated to match new strings.

**Tech Stack:** TypeScript, React, Vitest, JSON.

**Spec:** `docs/superpowers/specs/2026-04-27-translate-to-english-design.md`

---

### Task 1: Internal type values (difficulty + HomeTab)

**Files:**
- Modify: `src/lessons/types.ts`
- Modify: `src/lessons/data/html-01-structure.json`
- Modify: `src/lessons/data/challenge-01-simple-page.json`
- Modify: `src/home/homeStore.ts`
- Modify: `src/home/HomeShell.tsx`
- Modify: `src/home/rail/HomeNav.tsx`
- Modify: `src/palette/useCommandPaletteShortcut.ts`
- Modify: `src/palette/types.ts`

- [ ] **Step 1: Change `difficulty` type and JSON values**

In `src/lessons/types.ts`, change:
```ts
difficulty: "débutant" | "intermédiaire" | "avancé";
```
to:
```ts
difficulty: "beginner" | "intermediate" | "advanced";
```

In both JSON files, change `"difficulty": "débutant"` to `"difficulty": "beginner"`.

- [ ] **Step 2: Change `HomeTab` type and consumers**

In `src/home/homeStore.ts`, change:
```ts
export type HomeTab = "accueil" | "lessons" | "challenges";
// and default:
tab: "accueil",
```
to:
```ts
export type HomeTab = "home" | "lessons" | "challenges";
// and default:
tab: "home",
```

In `src/home/HomeShell.tsx`, replace all `"accueil"` with `"home"`.
In `src/home/rail/HomeNav.tsx`, replace `tab === "accueil"` and `setTab("accueil")` with `"home"`.
In `src/palette/useCommandPaletteShortcut.ts`, if it references `"accueil"`, replace with `"home"`.

- [ ] **Step 3: Change PALETTE_GROUP_LABELS**

In `src/palette/types.ts`, change:
```ts
export const PALETTE_GROUP_LABELS: Record<PaletteGroupKey, string> = {
  jump: "Reprendre",
  files: "Fichiers",
  commands: "Commandes",
  lessons: "Leçons",
};
```
to:
```ts
export const PALETTE_GROUP_LABELS: Record<PaletteGroupKey, string> = {
  jump: "Jump back in",
  files: "Files",
  commands: "Commands",
  lessons: "Lessons",
};
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: 0 errors (the type changes propagate correctly).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(i18n): switch internal type values from French to English"
```

---

### Task 2: Home components

**Files:**
- Modify: `src/home/rail/HomeNav.tsx`
- Modify: `src/home/rail/HomeRailFoot.tsx`
- Modify: `src/home/sections/HomeSearch.tsx`
- Modify: `src/home/sections/ContinueCard.tsx`
- Modify: `src/home/sections/ContinueLessonCard.tsx`
- Modify: `src/home/sections/ContinueSection.tsx`
- Modify: `src/home/sections/RecentProjectsSection.tsx`
- Modify: `src/home/sections/ChangelogModal.tsx`
- Modify: `src/home/sections/LessonCard.tsx`
- Modify: `src/home/sections/LessonsListView.tsx`
- Modify: `src/home/sections/ChallengesListView.tsx`

Translation table for this task:

| French | English |
|--------|---------|
| Accueil | Home |
| Leçons | Lessons |
| Nouveautés de la | What's new in |
| Docs et aide | Docs & help |
| Rechercher un projet, une leçon ou ouvrir un fichier… | Search projects, lessons, or open a file… |
| Rechercher | Search |
| Reprends là où tu t'étais arrêté | Pick up where you left off |
| fichier(s) | file(s) |
| ligne(s) | line(s) |
| modifié | edited |
| Continuer | Continue |
| Ouvrir le dossier | Open folder |
| Aucun projet en cours | No active project |
| Ouvre ou crée un projet pour le voir apparaître ici. | Open or create a project to see it here. |
| Projets récents | Recent projects |
| Pas encore de projets | No projects yet |
| La liste de tes projets récents arrivera avec le système de projets. | Your recent projects will appear here. |
| Nouveau projet | New project |
| Rechercher… | Search… |
| Nouveautés | What's new |
| Fermer | Close |
| Toutes les leçons | All lessons |
| Tous les challenges | All challenges |
| ✓ terminé | ✓ completed |
| ● en cours | ● in progress |
| pas commencé | not started |
| ✓ réussi | ✓ passed |
| pas tenté | not attempted |
| Leçon · checkpoint | Lesson · checkpoint |
| Challenge · checkpoint | Challenge · checkpoint |
| Ouvrir {name} | Open {name} |
| Ouvrir | Open |
| Ouvrir le dossier | Open folder |
| Renommer | Rename |
| Supprimer | Delete |

- [ ] **Step 1: Translate all Home component strings**

Go through each file and replace every French string with its English equivalent using the table above. Preserve the same structure — just change the text.

- [ ] **Step 2: Run typecheck + lint**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/home/
git commit -m "refactor(i18n): translate Home components to English"
```

---

### Task 3: IDE shell components

**Files:**
- Modify: `src/ide/shell/Toolbar.tsx`
- Modify: `src/ide/shell/statusBarFormat.ts`
- Modify: `src/ide/shell/ConfirmDialog.tsx`
- Modify: `src/ide/shell/Toasts.tsx`
- Modify: `src/ide/shell/fileErrorMessages.ts`
- Modify: `src/ide/tree/FileTree.tsx`
- Modify: `src/ide/dock/LessonDock.tsx`
- Modify: `src/ide/preview/PreviewBar.tsx` (if French strings exist)

Translation table:

| French | English |
|--------|---------|
| Retour à l'accueil | Back to home |
| Rechercher fichiers, commandes… | Search files, commands… |
| Annuler — bientôt disponible | Undo — coming soon |
| Formater — bientôt disponible | Format — coming soon |
| Texte | Text |
| Sauvegarde auto | Auto-save |
| Sauvegardé à l'instant | Saved just now |
| Sauvegardé il y a {n} s | Saved {n}s ago |
| Sauvegardé il y a {n} min | Saved {n}m ago |
| Sauvegardé il y a {n} h | Saved {n}h ago |
| Confirmer | Confirm |
| Annuler | Cancel |
| Fermer la notification | Close notification |
| Fichiers | Files |
| Nouveau fichier | New file |
| Aucun fichier | No files |
| Sauvegarde auto active | Auto-save active |
| Renommer | Rename |
| Supprimer le fichier | Delete file |
| Supprimer {path} ? Cette action est irréversible. | Delete {path}? This action cannot be undone. |
| Supprimer | Delete |
| Valider | Submit |
| nom du fichier | filename |
| Le nom ne peut pas contenir « / ». | Name cannot contain "/". |
| Caractère interdit dans le nom. | Forbidden character in name. |
| Le nom ne peut pas contenir « . » ou « .. ». | Name cannot contain "." or "..". |
| Le nom contient un caractère interdit... | Name contains a forbidden character... |
| Nom de fichier invalide. | Invalid filename. |
| Utilise « / » pour séparer les dossiers... | Use "/" to separate folders... |
| Un fichier du même nom existe déjà. | A file with this name already exists. |
| Ce fichier n'existe plus. | This file no longer exists. |
| Impossible de renommer un dossier. | Cannot rename a directory. |
| Impossible de supprimer un dossier directement. | Cannot delete a directory directly. |
| Leçon / Challenge | Lesson / Challenge |
| points | points |
| Survole un mot-clé dans l'éditeur pour une explication rapide. | Hover a keyword in the editor for a quick explanation. |
| Aucun fichier ouvert | No file open |
| Fermer {filename} | Close {filename} |

- [ ] **Step 1: Translate all IDE shell strings**

- [ ] **Step 2: Run typecheck + lint**

- [ ] **Step 3: Commit**

```bash
git add src/ide/
git commit -m "refactor(i18n): translate IDE shell components to English"
```

---

### Task 4: Project modals + actions

**Files:**
- Modify: `src/projects/ui/CreateProjectModal.tsx`
- Modify: `src/projects/ui/DeleteProjectDialog.tsx`
- Modify: `src/projects/ui/RenameProjectModal.tsx`
- Modify: `src/projects/actions.ts`
- Modify: `src/projects/paths.ts`
- Modify: `src/projects/diskAutoSave.ts`

Translation table:

| French | English |
|--------|---------|
| Choisis un emplacement | Choose a location |
| Nouveau projet | New project |
| Nom du projet | Project name |
| Mon super projet | My awesome project |
| Modèle | Template |
| Emplacement | Location |
| Changer… | Change… |
| Annuler | Cancel |
| Création… / Créer | Creating… / Create |
| Projet « {name} » créé. | Project "{name}" created. |
| Supprimer le projet | Delete project |
| Le projet {name} sera retiré de ta liste. | Project {name} will be removed from your list. |
| Aussi supprimer le dossier et tous ses fichiers sur le disque | Also delete the folder and all files from disk |
| Cette action est irréversible. Les fichiers seront définitivement supprimés. | This action cannot be undone. Files will be permanently deleted. |
| Suppression… | Deleting… |
| Supprimer le dossier | Delete folder |
| Retirer | Remove |
| Projet « {name} » et son dossier supprimés. | Project "{name}" and its folder deleted. |
| Projet « {name} » retiré de WeCode. | Project "{name}" removed from WeCode. |
| Renommer le projet | Rename project |
| Le dossier sur disque garde son nom d'origine — seule l'étiquette dans WeCode change. | The folder on disk keeps its original name — only the label in WeCode changes. |
| Nouveau nom | New name |
| Renommage… / Renommer | Renaming… / Rename |
| Projet renommé en « {name} ». | Project renamed to "{name}". |
| Un projet avec ce nom existe déjà dans ce dossier. | A project with this name already exists in this folder. |
| Un projet avec le nom « {name} » existe déjà. | A project named "{name}" already exists. |
| Le nom ne peut pas être vide. | Name cannot be empty. |
| Le nom est trop long (max 80 caractères). | Name is too long (max 80 characters). |
| Le nom ne peut pas contenir : \\ / : * ? " < > \| | Name cannot contain: \\ / : * ? " < > \| |
| Nom invalide. | Invalid name. |
| « {name} » est un nom réservé par Windows. | "{name}" is a Windows reserved name. |
| Impossible de sauvegarder {path} sur le disque. | Failed to save {path} to disk. |

- [ ] **Step 1: Translate all project modal and action strings**

- [ ] **Step 2: Run typecheck + lint**

- [ ] **Step 3: Commit**

```bash
git add src/projects/
git commit -m "refactor(i18n): translate project modals and actions to English"
```

---

### Task 5: Palette

**Files:**
- Modify: `src/palette/CommandPalette.tsx`
- Modify: `src/palette/commands.ts`
- Modify: `src/palette/sources.ts`

| French | English |
|--------|---------|
| Palette de commandes | Command palette |
| Rechercher un projet, une leçon ou ouvrir un fichier… | Search projects, lessons, or open a file… |
| Rechercher | Search |
| Effacer la recherche | Clear search |
| Aucun résultat pour « {query} ». | No results for "{query}". |
| naviguer | navigate |
| ouvrir | open |
| fermer | close |
| ↵ ouvrir | ↵ open |
| Nouveau projet | New project |
| Partir d'un modèle | From a template |
| commande | command |
| projet | project |
| fichier | file |
| leçon | lesson |
| Parcours de leçons | Lesson path |
| Bientôt disponible | Coming soon |

- [ ] **Step 1: Translate all palette strings**

- [ ] **Step 2: Commit**

```bash
git add src/palette/
git commit -m "refactor(i18n): translate command palette to English"
```

---

### Task 6: Editor hints

**Files:**
- Modify: `src/ide/editor/hints.ts`

This is the largest single file (~400 lines). Every `HTML_HINTS` and `CSS_HINTS` entry has French `kindLabel`, `title`, and `body` fields.

- [ ] **Step 1: Translate all hint entries**

Change `kindLabel`:
- `"Élément HTML"` → `"HTML Element"`
- `"Attribut HTML"` → `"HTML Attribute"`
- `"Propriété CSS"` → `"CSS Property"`

For each entry, translate the `body` field from French to English. Keep `title` as the technical term (already in English: `html`, `head`, `body`, `class`, etc.). Translate the French body text to concise English equivalents.

Example:
```ts
// Before:
html: { kind: "element", kindLabel: "Élément HTML", title: "<html>", body: "La racine de tout document HTML.", example: "..." },
// After:
html: { kind: "element", kindLabel: "HTML Element", title: "<html>", body: "The root of every HTML document.", example: "..." },
```

- [ ] **Step 2: Commit**

```bash
git add src/ide/editor/hints.ts
git commit -m "refactor(i18n): translate editor hover hints to English"
```

---

### Task 7: Lesson JSON content

**Files:**
- Modify: `src/lessons/data/html-01-structure.json`
- Modify: `src/lessons/data/challenge-01-simple-page.json`

- [ ] **Step 1: Translate lesson content**

`html-01-structure.json`:
- title: "HTML Page Structure"
- description: "Learn the basic tags: html, head, body, title, and paragraph."
- heading: "Build the skeleton"
- paragraphs: translate the instructional text
- checkpoint labels: "Add a `<head>` tag", "Add a `<body>` tag", etc.

`challenge-01-simple-page.json`:
- title: "Build a simple page"
- description: "A heading, a paragraph, and a background color — your turn."
- heading: "Objective"
- paragraph: translate
- checkpoint labels: "Add an `<h1>` heading", "Add a `<p>` paragraph", "Set a background color"

- [ ] **Step 2: Commit**

```bash
git add src/lessons/data/
git commit -m "refactor(i18n): translate lesson and challenge content to English"
```

---

### Task 8: In-app changelog

**Files:**
- Modify: `src/changelog.md`

- [ ] **Step 1: Rewrite changelog in English**

Replace the entire content with English equivalents. Section headings: `Added` / `Changed` / `Fixed` (matching the root `CHANGELOG.md` style). Translate every bullet point.

- [ ] **Step 2: Commit**

```bash
git add src/changelog.md
git commit -m "refactor(i18n): translate in-app changelog to English"
```

---

### Task 9: Update tests

**Files:**
- Modify: `src/ide/shell/fileErrorMessages.test.ts`
- Modify: `src/ide/shell/statusBarFormat.test.ts`
- Modify: `src/home/HomeShell.test.tsx`
- Modify: `src/palette/CommandPalette.test.tsx`

- [ ] **Step 1: Update test assertions to match English strings**

In `fileErrorMessages.test.ts`: French assertion strings → English (e.g., `"caractère interdit"` → `"forbidden character"` or whatever the new English message contains).

In `statusBarFormat.test.ts`: `"Sauvegarde auto"` → `"Auto-save"`, `"Sauvegardé à l'instant"` → `"Saved just now"`, etc.

In `HomeShell.test.tsx`: `screen.getByText(/Bienvenue dans/i)` → `screen.getByText(/Pick up where/i)` or whatever the new heading is. `screen.getByRole("heading", { name: /Projets récents/i })` → `"Recent projects"`.

In `CommandPalette.test.tsx`: French matchers → English.

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: all 154+ tests pass.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test(i18n): update test assertions for English strings"
```

---

### Task 10: CLAUDE.md update + final verification

**Files:**
- Modify: `CLAUDE.md` (project-level, local)

- [ ] **Step 1: Update CLAUDE.md**

Change `UI strings are in **French**.` to `UI strings are in **English**.`

Update the changelog convention to note both `CHANGELOG.md` and `src/changelog.md` are in English.

- [ ] **Step 2: Run full CI**

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

- [ ] **Step 3: Grep for remaining French**

```bash
grep -rn "Sauvegard\|Rechercher\|Nouveau\|Supprimer\|Renommer\|Annuler\|Confirmer\|Leçon\|débutant\|Reprends\|Fichiers\|dossier\|Accueil\|Parcours\|Bientôt\|Fermer\|Ouvrir le" src/ --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md"
```

Expected: 0 hits. If any remain, fix them.

- [ ] **Step 4: Commit**

```bash
git commit -m "docs(i18n): update CLAUDE.md for English-only UI"
```
