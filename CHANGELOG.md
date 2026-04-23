# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
