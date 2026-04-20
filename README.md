# WeCode

Learn HTML and CSS in a desktop IDE with live preview.

WeCode is a cross-platform desktop application that pairs a multi-file code editor with an instant rendered preview, built for people picking up their first web pages. The first milestone focuses solely on the IDE — courses and exercises will follow.

> Status: early development. The MVP scope is the IDE page; no lessons yet.

## Tech stack

- [Tauri v2](https://tauri.app) (Rust + system webview)
- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite](https://vitejs.dev)
- [CodeMirror 6](https://codemirror.net) for the editor
- `tauri-plugin-store` for persistence
- Custom URI protocol (`wecode://`) for the live preview

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 20
- [Rust](https://www.rust-lang.org/tools/install) stable (≥ 1.77)
- Platform-specific Tauri prerequisites: see the [official guide](https://tauri.app/start/prerequisites/).

### Install and run

```bash
npm install
npm run tauri dev
```

### Scripts

| Script                 | What it does                             |
| ---------------------- | ---------------------------------------- |
| `npm run tauri dev`    | Launch the desktop app with HMR          |
| `npm run tauri build`  | Produce a release installer for the host |
| `npm run lint`         | Run ESLint                               |
| `npm run typecheck`    | Run `tsc --noEmit`                       |
| `npm run format`       | Apply Prettier                           |
| `npm run format:check` | Report Prettier diffs without fixing     |

## License

MIT — see [LICENSE](LICENSE) once added.
