# Lessons & Challenges System — Design Spec

## Context

WeCode is a desktop IDE that teaches HTML and CSS. The app currently has two views: Home (project picker) and IDE (editor + preview). This spec adds a third pillar: **structured learning** through guided lessons and free-form challenges, both reusing the existing IDE shell.

The system ships as milestone 3. Scope for v1: the full engine (navigation, validation, progression, dock UI) plus **1 lesson + 1 challenge** as proof of concept.

## Architecture

### View routing

```
useIdeStore.view: "home" | "ide" | "lesson"
```

- `"home"` — Home shell with rail-routed sub-views
- `"ide"` — Free project editing (unchanged)
- `"lesson"` — IDE shell wrapped in a `LessonProvider` context

### Home sub-views (rail as router)

The Home rail gains clickable items that swap the main content zone:

```
useHomeStore.tab: "accueil" | "lessons" | "challenges"
```

| Rail item | Tab value | What the main zone shows |
|-----------|-----------|--------------------------|
| Accueil | `"accueil"` | Current home content (search, continue card, recent projects, templates) |
| Leçons | `"lessons"` | Grid of all lessons with progress indicators |
| Challenges | `"challenges"` | Grid of all challenges with completion status |

Items not yet wired (Projets, Cheatsheets, Settings) remain visible but disabled.

The rail shows a progress counter next to Leçons: `3 / 12` (completed / total).

### LessonProvider (React Context)

When `view === "lesson"`, `App.tsx` renders:

```tsx
<LessonProvider lessonId={activeLessonId}>
  <IdeShell />
</LessonProvider>
```

The context exposes:

```ts
interface LessonContextValue {
  lesson: LessonData;
  checkpoints: CheckpointState[];         // { id, status: "todo"|"active"|"done" }
  currentStepIndex: number;
  fileOpsLocked: boolean;                  // true for lessons, false for challenges
  progress: number;                        // 0–1 ratio
  validateNow: () => void;
  exitLesson: () => void;
}
```

Components that adapt their behavior in lesson mode:
- **FileTree** — hides create/delete/rename buttons when `fileOpsLocked`
- **Toolbar** — brand click calls `exitLesson()` instead of `setView("home")`
- **LessonDock** — reads `lesson`, `checkpoints`, `currentStepIndex` from context
- **StatusBar** — shows checkpoint progress instead of version chip

When the context is absent (free project mode), all components behave as today.

### Stores

**`useLessonStore`** (new Zustand store):
- `activeLessonId: string | null`
- `checkpointStates: Record<string, CheckpointStatus>`
- `startLesson(id): void` — hydrates VFS with starter files, sets view to `"lesson"`
- `completeCheckpoint(id): void`
- `resetLesson(id): void`

**`useHomeStore`** (new Zustand store):
- `tab: "accueil" | "lessons" | "challenges"`
- `setTab(tab): void`

**Global progression** — persisted via `tauri-plugin-store` as `wecode.progress.json`:
```ts
interface ProgressStore {
  version: 1;
  completed: Record<string, { completedAt: number }>;  // lessonId → timestamp
  checkpoints: Record<string, string[]>;                 // lessonId → completed checkpoint ids
}
```

## Lesson data format

Each lesson/challenge is a JSON file in `src/lessons/data/`:

```ts
interface LessonData {
  id: string;
  type: "lesson" | "challenge";
  title: string;
  description: string;
  difficulty: "débutant" | "intermédiaire" | "avancé";
  estimatedMinutes: number;
  tags: string[];
  allowFileOps: boolean;            // false for lessons, true for challenges
  starterFiles: Record<string, string>;  // VFS path → content
  steps: LessonStep[];
}

interface LessonStep {
  heading: string;
  paragraphs: LessonParagraph[];
  checkpoints: CheckpointDef[];
}

interface LessonParagraph {
  kind: "text" | "code";
  content: string;                  // text may contain `backtick` for inline code
}

interface CheckpointDef {
  id: string;
  label: string;
  rule: ValidationRule;
}
```

## Validation engine

### Rule types

| Type | Fields | What it checks |
|------|--------|----------------|
| `element-exists` | `selector`, `file` | `querySelector(selector)` returns ≥1 match |
| `element-count` | `selector`, `file`, `min?`, `max?` | Match count within range |
| `element-text` | `selector`, `file`, `text`, `match` | Element text content matches (`contains`, `exact`, `regex`, `not-empty`) |
| `attribute-exists` | `selector`, `file`, `attribute` | Element has the attribute |
| `attribute-value` | `selector`, `file`, `attribute`, `value?`, `match` | Attribute value check |
| `attribute-count` | `selector`, `file`, `minAttributes` | Element has ≥N attributes |
| `css-property` | `selector`, `file`, `property`, `match` | CSS property exists on selector |
| `css-property-value` | `selector`, `file`, `property`, `value`, `match` | CSS property value check (`exact`, `contains`, `gte`, `lte`) |
| `file-contains` | `file`, `text` | Raw source contains string |
| `file-not-contains` | `file`, `text` | Raw source does NOT contain string |
| `file-regex` | `file`, `pattern` | Raw source matches regex |
| `nesting` | `parent`, `child`, `direct?`, `file` | Child is descendant (or direct child) of parent |
| `element-order` | `selectors[]`, `within`, `file` | Elements appear in document order |
| `sibling` | `first`, `then`, `file` | Two elements are adjacent siblings |
| `indent-style` | `file`, `style` (`spaces`\|`tabs`), `size?` | Source follows indentation convention |
| `composite` | `operator` (`and`\|`or`), `rules[]` | Combines multiple rules |

### Match modes

`exact`, `contains`, `starts-with`, `ends-with`, `regex`, `not-empty`, `exists`, `gte`, `lte`.

### Execution

- **Trigger**: VFS `change` event, debounced 300 ms.
- **Method**: `DOMParser` parses the HTML source into a DOM. `querySelector` / `querySelectorAll` run the selectors. CSS rules are checked by parsing `<style>` tags and linked stylesheets from the VFS snapshot.
- **Output**: array of `{ checkpointId, passed: boolean }`. The `LessonProvider` diffs against current state and updates `useLessonStore`.
- **Feedback**: checkpoint rows in the dock animate from `active` (ambre, "vérification…") to `done` (vert, "fait") when a rule passes.

### Module location

`src/lessons/validation/` — pure functions, no React, testable under Node:
- `validate.ts` — orchestrator
- `rules/` — one file per rule type

## Dock UI

Reproduces the Claude Design handoff exactly (CSS from `WeCode IDE.html:504–610`, markup from `:862–920`).

### Layout

```
.dock
├── .dock-head (40px, clickable → toggle collapse)
│   ├── chevron SVG (rotates on collapse)
│   ├── .lesson-chip (ambre pill: number + "Leçon · titre")
│   └── .progress (right-aligned: "2 / 4 checkpoints" + progress ring SVG)
│
└── .dock-body (grid: 1fr 1.2fr, scrollable)
    ├── .lesson-text (left: heading + paragraphs + hint footer)
    └── .checkpoints (right: list of .cp rows)
```

### Checkpoint states

| Class | Tick | Label | Meta |
|-------|------|-------|------|
| `.cp` (todo) | Empty circle, `--line` border | Normal text | `—` |
| `.cp.active` | Circle, `--accent` border, ambre bg | Normal text | `vérification…` (ambre) |
| `.cp.done` | Filled `--accent`, checkmark in `--bg-0` | Strikethrough, muted | `fait` |

### Visibility

- **Lesson/challenge mode**: dock visible, collapsible
- **Free project mode**: dock hidden (not rendered)

## Home views

### Lessons list (`tab === "lessons"`)

Grid of lesson cards. Each card shows:
- Status badge: `✓ terminé` (green), `● en cours` (ambre), `pas commencé` (muted)
- Estimated time
- Title with lesson number
- Description (1 line)
- Progress bar (for in-progress lessons)

Clicking a card calls `startLesson(id)` → hydrates VFS, switches to `view: "lesson"`.

### Challenges list (`tab === "challenges"`)

Same card layout, adapted for challenges:
- Status: `✓ réussi` or `pas tenté`
- No progress bar (challenges are pass/fail)
- Clicking starts the challenge

### Continue card adaptation

The existing "Reprends là où tu t'étais arrêté" card on the Accueil tab gains the ability to show an in-progress lesson (not just projects). Priority: lesson in progress > last opened project.

## File structure

```
src/lessons/
  data/                          # JSON lesson files
    html-01-structure.json
    challenge-01-simple-page.json
    index.ts                     # registry: exports LESSONS and CHALLENGES arrays
  validation/
    validate.ts                  # orchestrator
    rules/                       # one file per rule type
      elementExists.ts
      cssProperty.ts
      fileContains.ts
      composite.ts
      ...
    types.ts                     # ValidationRule union type
  LessonProvider.tsx             # React context provider
  lessonStore.ts                 # Zustand store
  progressPersistence.ts         # tauri-plugin-store read/write

src/home/
  homeStore.ts                   # tab routing state
  sections/
    LessonsListView.tsx          # grid of lesson cards
    ChallengesListView.tsx       # grid of challenge cards
    LessonCard.tsx               # individual card
  rail/
    HomeNav.tsx                  # gains Leçons + Challenges items with counters

src/ide/
  dock/
    LessonDock.tsx               # rewritten to read LessonContext
    ProgressRing.tsx             # unchanged
  tree/
    FileTree.tsx                 # reads fileOpsLocked from context
  shell/
    Toolbar.tsx                  # brand click → exitLesson in lesson mode
    StatusBar.tsx                # checkpoint count in lesson mode
```

## v1 content

### Lesson: "La structure d'une page HTML"

- 1 step, 4–5 checkpoints
- Starter file: bare `index.html` with `<!DOCTYPE html><html></html>`
- Teaches: `<head>`, `<body>`, `<title>`, `<h1>`, `<p>`
- Rules: `element-exists` for each tag, `element-text` for title content

### Challenge: "Reproduis cette page simple"

- Starter files: empty `index.html` + `style.css`
- Goal: create a page with a heading, a paragraph, and a colored background
- Rules: `element-exists` for h1, p; `css-property` for background-color on body; `nesting` for h1 inside body
- `allowFileOps: true`

## Verification

```bash
npm run typecheck
npm run lint
npm run test              # validation engine unit tests + lesson store tests
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

Manual:
1. Home → rail → click Leçons → grid of lessons appears
2. Click lesson → IDE opens with starter files, dock shows instructions
3. Follow checkpoints → validation runs on each save, checkpoints animate to "done"
4. Complete all checkpoints → lesson marked as complete in progress store
5. Click brand → back to Home, lesson shows "✓ terminé"
6. Home → rail → Challenges → click challenge → IDE opens with file ops enabled
7. Quit mid-lesson → reopen → progress restored
