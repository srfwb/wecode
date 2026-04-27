# What's new

## v0.3.1 — April 27, 2026

### Changed

- The entire app is now in English — all labels, buttons, error messages, editor hints, lesson content, and the changelog itself.
- Date format switched to US English.
- Internal type values (`difficulty`, `HomeTab`) updated to English identifiers.

---

## v0.3.0 — April 27, 2026

### Added

- **Lesson system** — step-by-step guided lessons with real-time validation. The app checks your code on every edit and ticks off objectives as you go.
- **Challenge system** — open-ended challenges where you reach a goal without detailed instructions. You can create and delete files.
- **Tab navigation in Home** — the left rail is now a router: click Lessons or Challenges to see the full list with your progress.
- **Progress counter** — the rail shows how many lessons you have completed (e.g. `1 / 2`).
- **"Continue" card** — if you have a lesson in progress, the resume card shows it above your projects.
- **First lesson**: "HTML Page Structure" — learn `<head>`, `<body>`, `<title>`, `<h1>`, `<p>` with 5 checkpoints.
- **First challenge**: "Build a simple page" — a heading, a paragraph, and a background color.
- **Changelog modal** — click "What's new in vX.Y.Z" in the rail to view the update history.

### Changed

- Keyboard shortcuts (Ctrl+Tab, Ctrl+W) work in lesson mode. Ctrl+N is blocked (no file creation during a lesson).
- The lesson dock is a proper accessible `<button>` (with `aria-expanded`).
- The "Open" right-click context menu on a file works in lesson mode.
- The status bar shows checkpoint progress instead of the version in lesson mode.

### Fixed

- The dock collapses correctly (content no longer overflows below the header).
- The amber outline no longer appears on template selection buttons.
- The CSS property in validation rules is properly escaped (no false match with special characters).

---

## v0.2.0-2 — April 25, 2026

### Added

- **Command palette** (Ctrl+K / ⌘K) — search for a project, a file, or a command from Home.
- **Context menu** on the Recent Projects section — right-click to create a new project or start a search.
- **Pixel-perfect logo** — the WeCode logo now exactly matches the original design in all its variants.
- Open Graph banner and card for the GitHub repo.

### Changed

- The app no longer crashes if the last project's folder was deleted while it was closed.
- An error toast appears if autosave fails (disk full, permissions, etc.).
- Renaming a project to a name already taken by another is now blocked.
- The previous project's tabs are cleared when switching to another project.
- The "Open folder" button works on Windows (uses `revealItemInDir` instead of `openPath`).
- The project card appear animation is faster.
- Rail navigation items are now keyboard-accessible.
- Keyboard focus is visible on editor tabs.

### Fixed

- The stray orange outline no longer appears on template buttons or the context menu.
- The browser's native menu (Back, Refresh, Inspect) is blocked everywhere in the app.

---

## v0.2.0-1 — April 23, 2026

### Added

- **Home page** — default view with the recent projects list, the "Continue your path" section, and project templates.
- **Disk-backed projects** — each project is a real folder under `~/Documents/WeCode/`.
- Create a project from a template (Blank folder or HTML + CSS) with a native folder picker.
- Rename and delete a project (with an option to remove the folder from disk).
- Context menu on project cards: Open, Open folder, Rename, Delete.
- Automatic reload when an external editor modifies files in the active project.
- Mobile / desktop toggle in the preview panel.
- Hover tooltips on HTML and CSS keywords in the editor.
- Toast notifications and confirmation dialogs.
- Keyboard shortcuts: `Ctrl+N` (new file), `Ctrl+W` (close tab), `Ctrl+Tab` / `Ctrl+Shift+Tab` (navigate between tabs).
- Status bar with autosave, preview latency, language, encoding, line:column.
- Visual redesign based on an oklch design system (Geist + JetBrains Mono).

### Changed

- Preview latency reduced from ~1 s to ~100 ms.

### Fixed

- Listener leaks on HMR reloads.
- The preview panel no longer stays blank without updates.

---

## v0.1.0 — April 20, 2026

### Added

- First release: Tauri v2 shell, three-panel editor (file tree, CodeMirror 6 editor, live preview) with an in-memory virtual file system.
