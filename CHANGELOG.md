# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
