# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] — 2026-04-27

Full English translation — every UI string, editor hint, lesson content, and
internal type value switched from French to English.

### Changed

- All UI labels, buttons, placeholders, tooltips, aria-labels, toast messages, and error messages are now in English.
- Editor hover hints (~50 entries for HTML elements, attributes, and CSS properties) translated.
- Lesson and challenge content (titles, descriptions, instructions, checkpoint labels) translated.
- In-app changelog rewritten in English.
- Home greeting changed from "Bienvenue dans WeCode" to "Welcome to WeCode".
- Date format switched from `fr-FR` to `en-US`.
- `LessonData.difficulty` type values: `"débutant" | "intermédiaire" | "avancé"` → `"beginner" | "intermediate" | "advanced"`.
- `HomeTab` type: `"accueil"` → `"home"`.
- `PALETTE_GROUP_LABELS` values translated.

## [0.3.0] — 2026-04-27

Milestone 3: structured learning system with guided lessons and free-form
challenges. Reuses the existing IDE shell via a React context provider.

### Added

- Lesson system: guided step-by-step lessons with real-time checkpoint validation against user code (DOM/CSS rule checking via DOMParser, 300 ms debounce).
- Challenge system: free-form coding challenges with pass/fail checkpoints and file operations enabled.
- Home rail routing: Accueil / Leçons / Challenges tabs swap the main content zone. Progress counter on Leçons shows completed / total.
- Lesson dock: collapsible bottom panel with instructions, inline code formatting, and animated checkpoint rows (todo → active → done).
- LessonProvider context: wraps IdeShell in lesson mode, wires VFS changes to the validation engine, persists completion via `tauri-plugin-store`.
- Validation engine: 16 rule types defined (6 implemented: element-exists, file-contains, file-not-contains, css-property, nesting, composite). Unimplemented types warn at runtime.
- First lesson: "La structure d'une page HTML" (5 checkpoints: head, body, title, h1, p).
- First challenge: "Crée une page simple" (3 checkpoints: h1, p, background-color).
- Continue card shows in-progress lessons with priority over projects.
- In-app changelog modal opened from the Home rail footer ("Nouveautés de la vX.Y.Z").

### Changed

- Home rail nav items are now semantic `<button>` elements with hover, focus, and disabled states.
- IDE shortcuts (Ctrl+Tab, Ctrl+W) work in lesson view. Ctrl+N is blocked when file ops are locked.
- Dock header is a `<button>` with `aria-expanded` instead of a `<div>`.
- StatusBar shows checkpoint progress instead of version number in lesson mode.
- FileTree hides create/delete/rename in lesson mode; context menu shows only "Ouvrir".

### Fixed

- Dock collapse now works correctly (`overflow: hidden` restored).
- CSS `rule.property` is regex-escaped before interpolation into `new RegExp()`.
- Template selector buttons no longer show a parasitic amber focus ring on click.
- `ContinueLessonCard` displays "Challenge" instead of "Leçon" for challenge type.
- Regex `/g` flag statefulness bug in CSS property checker (lastIndex persisted across calls).
- `startLesson` calls `syncVfsNow` so the preview iframe loads starter files immediately.

## [0.2.0-2] — 2026-04-23

Pre-release. Security hardening, accessibility baseline, transactional project
operations and polish across every modal. Also fixes the Windows self-echo
suppression that had been wasting an I/O round trip on every keystroke.

### Added

- Windows reserved names (`CON`, `PRN`, `AUX`, `NUL`, `COM1`–`COM9`, `LPT1`–`LPT9`) are rejected up front when naming a project.
- Keyboard focus ring is now visible on every focusable control (WCAG 2.4.7).
- Animations respect the OS-level `prefers-reduced-motion: reduce` preference (WCAG 2.3.3).
- Modals honor their `aria-modal` contract: Escape closes, Tab cycles inside, focus returns to the trigger on close.
- File-tree create / rename inputs validate the name inline and show a French hint before submission.

### Changed

- Muted small text (project path, relative timestamps, section counters) bumped to WCAG AA contrast (~4.9:1) on dark surfaces.
- Project creation is now transactional — a failed template write rolls back the partial folder instead of leaving an orphan.
- Project deletion with "also remove folder" runs the disk delete first so a failure leaves the app state untouched.
- File-tree no longer re-renders on every editor keystroke — structural events only.
- File-system error messages surfaced in toasts are now translated to French.
- Rename project modal grows a `submitting` guard to block double submits.
- Application version in the status bar and Home brand is sourced from `package.json` at build time.
- `tauri-action` bumped from `v0.5.22` to `v0.6.2`.
- Release body link to the CHANGELOG now points to an absolute URL pinned to the tag, so it no longer 404s.
- CSS design tokens consolidated: `--font-ui` / `--font-mono` (was `--ui` / `--mono`), new `--shadow-*`, `--backdrop`, `--z-*`, `--t-fast`.

### Fixed

- Global keyboard shortcuts (`Ctrl+W`, `Ctrl+N`, `Ctrl+Tab`) no longer fire while typing in an input, textarea, `contenteditable`, or during an IME composition.
- Preview iframe now reloads reliably after a project switch, not only on the first open from Accueil.
- Rapid-clicking two project cards can no longer interleave the open-project flows and write one project's files into the other's folder.
- Windows watcher self-echo suppression now matches paths correctly (the `\\?\` UNC prefix is normalised on both sides).
- Bootstrap no longer re-seeds `First steps` when the projects index exists but is empty — a user who intentionally deleted all their projects keeps an empty list.
- Late file-change events from a previously-watched project no longer apply to the newly-active project's VFS.

### Security

- `fs_delete_dir` is anchored to the canonicalised `~/Documents/WeCode/` root; paths outside the root, or the root itself, are refused. Previous heuristic (refuse paths with fewer than 4 components) let through targets like `C:\Users\<user>`.
- `fs_write_file` now routes through `resolve_inside` like every other FS command, so it validates the target stays inside the project root.
- `fs_rename_file` refuses directory targets.
- `RecentWritesState` self-echo registry is bounded in memory (stale entries pruned on each record) and cleared on `watcher_stop`.

## [0.2.0-1] — 2026-04-23

Pre-release. First version to ship the Welcome page and the on-disk project
model. Expect breaking changes before 0.2.0 final. The numeric pre-release
identifier (`-1` rather than `-rc.1`) is required by the Windows MSI bundler,
which rejects non-numeric pre-release tags.

### Added

- Welcome page as the default view — Accueil item, greeting, search placeholder, empty sections that fill as features land.
- Projects are now real folders on disk under `~/Documents/WeCode/`.
- Migration of the single legacy workspace into a `First steps` project on first launch (user files preserved).
- Create project from a template (`Dossier vierge` or `HTML + CSS`) with a native folder picker to override the default location.
- Rename a project (label only — the folder on disk keeps its name).
- Delete a project with an optional checkbox to also remove its folder on disk.
- Right-click context menu on project cards: `Ouvrir`, `Ouvrir le dossier`, `Renommer`, `Supprimer`.
- Live reload when external editors change the active project's files (watcher with self-echo suppression).
- Return to Accueil by clicking the WeCode brand in the IDE toolbar.
- View transition animation between Accueil and IDE + stagger animation on recent projects grid.
- Mobile / desktop device switcher in the preview.
- Hover hints on HTML and CSS tokens in the editor.
- Lesson dock UI shell (mocked content for now).
- Toast notifications and confirmation dialogs.
- Global keyboard shortcuts: `Ctrl+N` (new file), `Ctrl+W` (close tab), `Ctrl+Tab` / `Ctrl+Shift+Tab` (cycle tabs).
- Status bar with auto-save status, live preview latency, language, encoding, line:col.
- Visual refresh based on an oklch design system (Geist + JetBrains Mono).

### Changed

- Default seed files (`index.html`, `style.css`) translated to English.
- Keystroke-to-paint preview latency cut from ~1 s to ~100 ms.
- IDE view is now one of two top-level views, gated by a Zustand `view` slot.

### Fixed

- Listener leaks across HMR reloads.
- Preview pane going blank without live updates.

## [0.1.0] — 2026-04-20

### Added

- Initial release: Tauri v2 desktop shell, three-pane IDE layout (file tree, CodeMirror 6 editor, sandboxed live preview) backed by an in-memory virtual filesystem persisted via `tauri-plugin-store`.
