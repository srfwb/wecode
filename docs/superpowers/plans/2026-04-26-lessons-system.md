# Lessons & Challenges System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add structured learning (guided lessons + free-form challenges) to WeCode, reusing the existing IDE shell via a React context provider.

**Architecture:** The Home rail becomes a router (`useHomeStore.tab`). A new `view: "lesson"` wraps the IDE in a `LessonProvider` context that overrides file operations, shows a lesson dock, and runs a validation engine against the user's code. Progression persists in `wecode.progress.json` via `tauri-plugin-store`.

**Tech Stack:** React 19, Zustand, TypeScript, Vitest, DOMParser (native), tauri-plugin-store.

**Spec:** `docs/superpowers/specs/2026-04-26-lessons-system-design.md`

---

### Task 1: Validation types

**Files:**
- Create: `src/lessons/validation/types.ts`
- Test: `src/lessons/validation/types.test.ts`

- [ ] **Step 1: Write the validation rule type union**

```ts
// src/lessons/validation/types.ts
export type MatchMode =
  | "exact"
  | "contains"
  | "starts-with"
  | "ends-with"
  | "regex"
  | "not-empty"
  | "exists"
  | "gte"
  | "lte";

export type ValidationRule =
  | { type: "element-exists"; selector: string; file: string }
  | { type: "element-count"; selector: string; file: string; min?: number; max?: number }
  | { type: "element-text"; selector: string; file: string; text: string; match: MatchMode }
  | { type: "attribute-exists"; selector: string; file: string; attribute: string }
  | {
      type: "attribute-value";
      selector: string;
      file: string;
      attribute: string;
      value?: string;
      match: MatchMode;
    }
  | { type: "attribute-count"; selector: string; file: string; minAttributes: number }
  | { type: "css-property"; selector: string; file: string; property: string; match: MatchMode }
  | {
      type: "css-property-value";
      selector: string;
      file: string;
      property: string;
      value: string;
      match: MatchMode;
    }
  | { type: "file-contains"; file: string; text: string }
  | { type: "file-not-contains"; file: string; text: string }
  | { type: "file-regex"; file: string; pattern: string }
  | { type: "nesting"; parent: string; child: string; direct?: boolean; file: string }
  | { type: "element-order"; selectors: string[]; within: string; file: string }
  | { type: "sibling"; first: string; then: string; file: string }
  | { type: "indent-style"; file: string; style: "spaces" | "tabs"; size?: number }
  | { type: "composite"; operator: "and" | "or"; rules: ValidationRule[] };

export interface CheckpointResult {
  checkpointId: string;
  passed: boolean;
}
```

- [ ] **Step 2: Write a smoke test to verify the types compile**

```ts
// src/lessons/validation/types.test.ts
import { describe, expect, test } from "vitest";
import type { ValidationRule } from "./types";

describe("ValidationRule types", () => {
  test("element-exists rule is well-typed", () => {
    const rule: ValidationRule = { type: "element-exists", selector: "h1", file: "/index.html" };
    expect(rule.type).toBe("element-exists");
  });

  test("composite rule accepts nested rules", () => {
    const rule: ValidationRule = {
      type: "composite",
      operator: "and",
      rules: [
        { type: "element-exists", selector: "h1", file: "/index.html" },
        { type: "file-contains", file: "/index.html", text: "<h1>" },
      ],
    };
    expect(rule.rules).toHaveLength(2);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test -- --run src/lessons/validation/types.test.ts`
Expected: 2 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lessons/validation/types.ts src/lessons/validation/types.test.ts
git commit -m "feat(lessons): add validation rule type definitions"
```

---

### Task 2: Core validation rules (element-exists, file-contains, css-property)

**Files:**
- Create: `src/lessons/validation/rules/elementExists.ts`
- Create: `src/lessons/validation/rules/fileContains.ts`
- Create: `src/lessons/validation/rules/cssProperty.ts`
- Create: `src/lessons/validation/rules/composite.ts`
- Create: `src/lessons/validation/rules/nesting.ts`
- Test: `src/lessons/validation/rules/rules.test.ts`

For each rule function: signature is `(rule: SpecificRule, files: Record<string, string>) => boolean`. `files` is the VFS snapshot (`{ "/index.html": "<html>...", "/style.css": "body{...}" }`). Pure functions, no DOM globals — use `new DOMParser()` (available in jsdom/browser).

- [ ] **Step 1: Write failing tests for core rules**

```ts
// src/lessons/validation/rules/rules.test.ts
// @vitest-environment jsdom
import { describe, expect, test } from "vitest";

import { checkElementExists } from "./elementExists";
import { checkFileContains, checkFileNotContains } from "./fileContains";
import { checkCssProperty } from "./cssProperty";
import { checkNesting } from "./nesting";
import { checkComposite } from "./composite";

const HTML = `<!DOCTYPE html><html><head><title>Test</title></head><body><h1 class="title">Hello</h1><p>World</p></body></html>`;
const CSS = `body { background-color: red; font-size: 16px; }\n.title { color: blue; }`;
const FILES: Record<string, string> = { "/index.html": HTML, "/style.css": CSS };

describe("elementExists", () => {
  test("passes when selector matches", () => {
    expect(checkElementExists({ type: "element-exists", selector: "h1", file: "/index.html" }, FILES)).toBe(true);
  });
  test("fails when selector does not match", () => {
    expect(checkElementExists({ type: "element-exists", selector: "h2", file: "/index.html" }, FILES)).toBe(false);
  });
  test("fails when file is missing", () => {
    expect(checkElementExists({ type: "element-exists", selector: "h1", file: "/missing.html" }, FILES)).toBe(false);
  });
});

describe("fileContains", () => {
  test("passes when text is present", () => {
    expect(checkFileContains({ type: "file-contains", file: "/style.css", text: "background-color" }, FILES)).toBe(true);
  });
  test("fails when text is absent", () => {
    expect(checkFileContains({ type: "file-contains", file: "/style.css", text: "display: flex" }, FILES)).toBe(false);
  });
});

describe("fileNotContains", () => {
  test("passes when text is absent", () => {
    expect(checkFileNotContains({ type: "file-not-contains", file: "/index.html", text: "<br><br>" }, FILES)).toBe(true);
  });
  test("fails when text is present", () => {
    expect(checkFileNotContains({ type: "file-not-contains", file: "/index.html", text: "<h1" }, FILES)).toBe(false);
  });
});

describe("cssProperty", () => {
  test("passes when selector has the property", () => {
    expect(checkCssProperty({ type: "css-property", selector: "body", file: "/style.css", property: "background-color", match: "exists" }, FILES)).toBe(true);
  });
  test("fails when property is missing", () => {
    expect(checkCssProperty({ type: "css-property", selector: "body", file: "/style.css", property: "display", match: "exists" }, FILES)).toBe(false);
  });
  test("fails when selector is missing", () => {
    expect(checkCssProperty({ type: "css-property", selector: ".missing", file: "/style.css", property: "color", match: "exists" }, FILES)).toBe(false);
  });
});

describe("nesting", () => {
  test("passes when child is inside parent", () => {
    expect(checkNesting({ type: "nesting", parent: "body", child: "h1", file: "/index.html" }, FILES)).toBe(true);
  });
  test("fails when child is not inside parent", () => {
    expect(checkNesting({ type: "nesting", parent: "h1", child: "p", file: "/index.html" }, FILES)).toBe(false);
  });
  test("direct child check", () => {
    expect(checkNesting({ type: "nesting", parent: "body", child: "h1", direct: true, file: "/index.html" }, FILES)).toBe(true);
    expect(checkNesting({ type: "nesting", parent: "html", child: "h1", direct: true, file: "/index.html" }, FILES)).toBe(false);
  });
});

describe("composite", () => {
  test("AND passes when all sub-rules pass", () => {
    expect(checkComposite({
      type: "composite", operator: "and", rules: [
        { type: "element-exists", selector: "h1", file: "/index.html" },
        { type: "file-contains", file: "/style.css", text: "body" },
      ]
    }, FILES)).toBe(true);
  });
  test("AND fails when one sub-rule fails", () => {
    expect(checkComposite({
      type: "composite", operator: "and", rules: [
        { type: "element-exists", selector: "h1", file: "/index.html" },
        { type: "element-exists", selector: "h99", file: "/index.html" },
      ]
    }, FILES)).toBe(false);
  });
  test("OR passes when any sub-rule passes", () => {
    expect(checkComposite({
      type: "composite", operator: "or", rules: [
        { type: "element-exists", selector: "h99", file: "/index.html" },
        { type: "element-exists", selector: "h1", file: "/index.html" },
      ]
    }, FILES)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/lessons/validation/rules/rules.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement the rule functions**

Each rule function follows: parse HTML/CSS from files map, apply the check, return boolean.

`elementExists.ts`:
```ts
export function checkElementExists(
  rule: { type: "element-exists"; selector: string; file: string },
  files: Record<string, string>,
): boolean {
  const html = files[rule.file];
  if (html === undefined) return false;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.querySelector(rule.selector) !== null;
}
```

`fileContains.ts`:
```ts
export function checkFileContains(
  rule: { type: "file-contains"; file: string; text: string },
  files: Record<string, string>,
): boolean {
  const content = files[rule.file];
  if (content === undefined) return false;
  return content.includes(rule.text);
}

export function checkFileNotContains(
  rule: { type: "file-not-contains"; file: string; text: string },
  files: Record<string, string>,
): boolean {
  const content = files[rule.file];
  if (content === undefined) return true;
  return !content.includes(rule.text);
}
```

`cssProperty.ts` — parses CSS text to find selector + property:
```ts
const RULE_RE = /([^{}]+)\{([^}]*)\}/g;

function findCssRules(css: string): Array<{ selector: string; body: string }> {
  const results: Array<{ selector: string; body: string }> = [];
  let match;
  while ((match = RULE_RE.exec(css)) !== null) {
    const selector = (match[1] ?? "").trim();
    const body = match[2] ?? "";
    results.push({ selector, body });
  }
  return results;
}

export function checkCssProperty(
  rule: { type: "css-property"; selector: string; file: string; property: string; match: string },
  files: Record<string, string>,
): boolean {
  const css = files[rule.file];
  if (css === undefined) return false;
  const parsed = findCssRules(css);
  const matching = parsed.find((r) => r.selector === rule.selector);
  if (!matching) return false;
  const propRe = new RegExp(`${rule.property}\\s*:`, "i");
  return propRe.test(matching.body);
}
```

`nesting.ts`:
```ts
export function checkNesting(
  rule: { type: "nesting"; parent: string; child: string; direct?: boolean; file: string },
  files: Record<string, string>,
): boolean {
  const html = files[rule.file];
  if (html === undefined) return false;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const selector = rule.direct
    ? `${rule.parent} > ${rule.child}`
    : `${rule.parent} ${rule.child}`;
  return doc.querySelector(selector) !== null;
}
```

`composite.ts` — imports all other rules and delegates:
```ts
import type { ValidationRule } from "../types";
import { checkElementExists } from "./elementExists";
import { checkFileContains, checkFileNotContains } from "./fileContains";
import { checkCssProperty } from "./cssProperty";
import { checkNesting } from "./nesting";

export function evaluateRule(rule: ValidationRule, files: Record<string, string>): boolean {
  switch (rule.type) {
    case "element-exists": return checkElementExists(rule, files);
    case "file-contains": return checkFileContains(rule, files);
    case "file-not-contains": return checkFileNotContains(rule, files);
    case "css-property": return checkCssProperty(rule, files);
    case "nesting": return checkNesting(rule, files);
    case "composite": return checkComposite(rule, files);
    default: return false;
  }
}

export function checkComposite(
  rule: { type: "composite"; operator: "and" | "or"; rules: ValidationRule[] },
  files: Record<string, string>,
): boolean {
  if (rule.operator === "and") return rule.rules.every((r) => evaluateRule(r, files));
  return rule.rules.some((r) => evaluateRule(r, files));
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- --run src/lessons/validation/rules/rules.test.ts`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lessons/validation/rules/
git commit -m "feat(validation): implement core rule checkers with tests"
```

---

### Task 3: Validation orchestrator

**Files:**
- Create: `src/lessons/validation/validate.ts`
- Test: `src/lessons/validation/validate.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/lessons/validation/validate.test.ts
// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { validateCheckpoints } from "./validate";
import type { CheckpointResult } from "./types";

const FILES = {
  "/index.html": "<!DOCTYPE html><html><head></head><body><h1>Hi</h1></body></html>",
  "/style.css": "body { color: red; }",
};

const CHECKPOINTS = [
  { id: "has-head", label: "Add head", rule: { type: "element-exists" as const, selector: "head", file: "/index.html" } },
  { id: "has-h2", label: "Add h2", rule: { type: "element-exists" as const, selector: "h2", file: "/index.html" } },
  { id: "has-color", label: "Set color", rule: { type: "css-property" as const, selector: "body", file: "/style.css", property: "color", match: "exists" as const } },
];

describe("validateCheckpoints", () => {
  test("returns results for each checkpoint", () => {
    const results = validateCheckpoints(CHECKPOINTS, FILES);
    expect(results).toHaveLength(3);
    expect(results.find((r) => r.checkpointId === "has-head")?.passed).toBe(true);
    expect(results.find((r) => r.checkpointId === "has-h2")?.passed).toBe(false);
    expect(results.find((r) => r.checkpointId === "has-color")?.passed).toBe(true);
  });
});
```

- [ ] **Step 2: Implement**

```ts
// src/lessons/validation/validate.ts
import type { CheckpointResult, ValidationRule } from "./types";
import { evaluateRule } from "./rules/composite";

interface CheckpointDef {
  id: string;
  label: string;
  rule: ValidationRule;
}

export function validateCheckpoints(
  checkpoints: CheckpointDef[],
  files: Record<string, string>,
): CheckpointResult[] {
  return checkpoints.map((cp) => ({
    checkpointId: cp.id,
    passed: evaluateRule(cp.rule, files),
  }));
}
```

- [ ] **Step 3: Run tests, commit**

Run: `npm test -- --run src/lessons/validation/validate.test.ts`

```bash
git add src/lessons/validation/validate.ts src/lessons/validation/validate.test.ts
git commit -m "feat(validation): add checkpoint validation orchestrator"
```

---

### Task 4: Lesson data types, JSON content, and registry

**Files:**
- Create: `src/lessons/types.ts`
- Create: `src/lessons/data/html-01-structure.json`
- Create: `src/lessons/data/challenge-01-simple-page.json`
- Create: `src/lessons/data/index.ts`

- [ ] **Step 1: Write the lesson data types**

```ts
// src/lessons/types.ts
import type { ValidationRule } from "./validation/types";

export interface LessonParagraph {
  kind: "text" | "code";
  content: string;
}

export interface CheckpointDef {
  id: string;
  label: string;
  rule: ValidationRule;
}

export interface LessonStep {
  heading: string;
  paragraphs: LessonParagraph[];
  checkpoints: CheckpointDef[];
}

export interface LessonData {
  id: string;
  type: "lesson" | "challenge";
  title: string;
  description: string;
  difficulty: "débutant" | "intermédiaire" | "avancé";
  estimatedMinutes: number;
  tags: string[];
  allowFileOps: boolean;
  starterFiles: Record<string, string>;
  steps: LessonStep[];
}

export type CheckpointStatus = "todo" | "active" | "done";

export interface CheckpointState {
  id: string;
  status: CheckpointStatus;
}
```

- [ ] **Step 2: Write the first lesson JSON**

Create `src/lessons/data/html-01-structure.json` with a lesson teaching `<head>`, `<body>`, `<title>`, `<h1>`, `<p>`. One step, 5 checkpoints using `element-exists` and `element-text` rules. Starter file is a bare `<!DOCTYPE html>\n<html>\n</html>`.

- [ ] **Step 3: Write the first challenge JSON**

Create `src/lessons/data/challenge-01-simple-page.json` with `allowFileOps: true`, starter files `index.html` + `style.css`, and checkpoints for h1, p, background-color.

- [ ] **Step 4: Write the registry**

```ts
// src/lessons/data/index.ts
import type { LessonData } from "../types";
import html01 from "./html-01-structure.json";
import challenge01 from "./challenge-01-simple-page.json";

export const LESSONS: readonly LessonData[] = [html01 as LessonData];
export const CHALLENGES: readonly LessonData[] = [challenge01 as LessonData];
export const ALL_CONTENT: readonly LessonData[] = [...LESSONS, ...CHALLENGES];

export function getLessonById(id: string): LessonData | undefined {
  return ALL_CONTENT.find((l) => l.id === id);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lessons/types.ts src/lessons/data/
git commit -m "feat(lessons): add data types, first lesson and challenge content"
```

---

### Task 5: Lesson store + progress persistence

**Files:**
- Create: `src/lessons/lessonStore.ts`
- Create: `src/lessons/progressPersistence.ts`
- Test: `src/lessons/lessonStore.test.ts`

- [ ] **Step 1: Write the lesson store**

Zustand store with `activeLessonId`, `checkpointStates`, `startLesson(id)`, `completeCheckpoint(id)`, `resetLesson(id)`, `exitLesson()`. `startLesson` hydrates VFS with starter files and sets `useIdeStore.view` to `"lesson"`.

- [ ] **Step 2: Write progress persistence**

`loadProgress()` and `saveProgress()` using `persistedStore("wecode.progress.json")`, same pattern as `src/projects/persistence.ts`.

- [ ] **Step 3: Write tests for the store**

Test `startLesson` sets `activeLessonId`, `completeCheckpoint` transitions status, `exitLesson` clears state and sets view to `"home"`.

- [ ] **Step 4: Run tests, commit**

```bash
git add src/lessons/lessonStore.ts src/lessons/progressPersistence.ts src/lessons/lessonStore.test.ts
git commit -m "feat(lessons): add lesson store and progress persistence"
```

---

### Task 6: Home store + rail routing

**Files:**
- Create: `src/home/homeStore.ts`
- Modify: `src/home/rail/HomeNav.tsx`
- Modify: `src/home/HomeShell.tsx`

- [ ] **Step 1: Create home store**

```ts
// src/home/homeStore.ts
import { create } from "zustand";

export type HomeTab = "accueil" | "lessons" | "challenges";

interface HomeState {
  tab: HomeTab;
  setTab: (tab: HomeTab) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  tab: "accueil",
  setTab: (tab) => set({ tab }),
}));
```

- [ ] **Step 2: Update HomeNav with routable items + counters**

Add Leçons item (with `X / Y` counter from progress store) and Challenges item. Accueil is the default active. Items like Projets, Cheatsheets, Settings stay disabled.

- [ ] **Step 3: Update HomeShell to route based on tab**

```tsx
// HomeShell main zone switches on useHomeStore.tab:
// "accueil" → current content (AccueilView extracted from current HomeShell)
// "lessons" → <LessonsListView />
// "challenges" → <ChallengesListView />
```

- [ ] **Step 4: Commit**

```bash
git add src/home/homeStore.ts src/home/rail/HomeNav.tsx src/home/HomeShell.tsx
git commit -m "feat(home): add rail tab routing for lessons and challenges"
```

---

### Task 7: Lessons & Challenges list views

**Files:**
- Create: `src/home/sections/LessonCard.tsx`
- Create: `src/home/sections/LessonsListView.tsx`
- Create: `src/home/sections/ChallengesListView.tsx`

- [ ] **Step 1: Create LessonCard component**

Displays: status badge (terminé/en cours/pas commencé), estimated time, title, description, optional progress bar. Clicking calls `useLessonStore.startLesson(id)`.

- [ ] **Step 2: Create LessonsListView**

Imports `LESSONS` from registry, reads progress from `useLessonStore`, renders a grid of `LessonCard` components with the heading "Toutes les leçons" and a completion counter.

- [ ] **Step 3: Create ChallengesListView**

Same structure but for challenges. Status is `✓ réussi` or `pas tenté`. No progress bar.

- [ ] **Step 4: Add CSS for lesson cards and list views**

New `.lesson-card`, `.lesson-card--in-progress`, `.lesson-card--done` classes in `global.css`. Follow the existing card pattern (`.home-proj` style) with status badges using `--ok` for done and `--accent` for in-progress.

- [ ] **Step 5: Commit**

```bash
git add src/home/sections/LessonCard.tsx src/home/sections/LessonsListView.tsx src/home/sections/ChallengesListView.tsx src/styles/global.css
git commit -m "feat(home): add lessons and challenges list views with cards"
```

---

### Task 8: LessonProvider context

**Files:**
- Create: `src/lessons/LessonProvider.tsx`
- Create: `src/lessons/useLessonContext.ts`

- [ ] **Step 1: Create the context and provider**

`LessonProvider` wraps children, reads `activeLessonId` from `useLessonStore`, loads the lesson data via `getLessonById`, subscribes to VFS changes (debounced 300 ms) to run `validateCheckpoints`, and exposes the `LessonContextValue` interface from the spec.

- [ ] **Step 2: Create the consumer hook**

```ts
// src/lessons/useLessonContext.ts
import { useContext } from "react";
import { LessonContext } from "./LessonProvider";

export function useLessonContext() {
  return useContext(LessonContext);
}
```

Returns `LessonContextValue | null`. Components check for null to know if they're in lesson mode.

- [ ] **Step 3: Commit**

```bash
git add src/lessons/LessonProvider.tsx src/lessons/useLessonContext.ts
git commit -m "feat(lessons): add LessonProvider context with validation wiring"
```

---

### Task 9: Dock UI rewrite

**Files:**
- Modify: `src/ide/dock/LessonDock.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Rewrite LessonDock to read context**

Replace mock data imports with `useLessonContext()`. If context is null, return null (hides dock in project mode). Render the design-faithful layout: `.dock-head` with chevron + lesson-chip + progress, `.dock-body` grid with `.lesson-text` (left) and `.checkpoints` (right). Checkpoint rows use `.cp`, `.cp.active`, `.cp.done` classes based on `checkpoints[i].status`.

- [ ] **Step 2: Update CSS to match the Claude Design handoff**

Port the CSS from `WeCode IDE.html:504–610` into `global.css`. Key classes: `.dock`, `.dock-head`, `.lesson-chip`, `.progress`, `.progress-ring`, `.dock-body`, `.lesson-text`, `.checkpoints`, `.cp`, `.cp.done`, `.cp.active`. All using existing design tokens.

- [ ] **Step 3: Remove mockLesson.ts**

Delete `src/ide/dock/mockLesson.ts` — no longer needed.

- [ ] **Step 4: Commit**

```bash
git add src/ide/dock/LessonDock.tsx src/ide/dock/mockLesson.ts src/styles/global.css
git commit -m "feat(dock): rewrite lesson dock to use context and match design"
```

---

### Task 10: IDE shell adaptations

**Files:**
- Modify: `src/ide/tree/FileTree.tsx`
- Modify: `src/ide/shell/Toolbar.tsx`
- Modify: `src/ide/shell/StatusBar.tsx`
- Modify: `src/App.tsx`
- Modify: `src/state/ideStore.ts`

- [ ] **Step 1: Add "lesson" to the View type**

In `src/state/ideStore.ts`, extend `View = "home" | "ide"` to `View = "home" | "ide" | "lesson"`.

- [ ] **Step 2: FileTree — hide file-ops buttons in lesson mode**

Read `useLessonContext()`. If `context?.fileOpsLocked`, hide the "new file" button and suppress the create/rename/delete context menu items.

- [ ] **Step 3: Toolbar — brand click exits lesson**

Read `useLessonContext()`. If context exists, brand click calls `context.exitLesson()` instead of `setView("home")`.

- [ ] **Step 4: StatusBar — show checkpoint progress**

Read `useLessonContext()`. If context exists, replace the version chip with a checkpoint counter (`2 / 4 checkpoints`).

- [ ] **Step 5: App.tsx — render LessonProvider when view is "lesson"**

```tsx
{view === "lesson" ? (
  <LessonProvider><IdeShell key="lesson" /></LessonProvider>
) : view === "home" ? (
  <HomeShell key="home" />
) : (
  <IdeShell key="ide" />
)}
```

- [ ] **Step 6: Commit**

```bash
git add src/state/ideStore.ts src/ide/tree/FileTree.tsx src/ide/shell/Toolbar.tsx src/ide/shell/StatusBar.tsx src/App.tsx
git commit -m "feat(ide): adapt shell components for lesson mode via context"
```

---

### Task 11: Continue card adaptation

**Files:**
- Modify: `src/home/sections/ContinueSection.tsx`

- [ ] **Step 1: Read lesson progress alongside project data**

If an in-progress lesson exists (at least one checkpoint done, not all done), show it in the continue card instead of the last project. Priority: lesson in progress > last project.

- [ ] **Step 2: Adapt continue card display for lessons**

Show lesson title, step name, checkpoint progress (`2 / 4 checkpoints`), "Continuer" button calls `startLesson(id)`.

- [ ] **Step 3: Commit**

```bash
git add src/home/sections/ContinueSection.tsx
git commit -m "feat(home): continue card shows in-progress lesson"
```

---

### Task 12: Integration verification

- [ ] **Step 1: Run full CI**

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

- [ ] **Step 2: Manual smoke test**

Following the spec verification checklist:
1. Home → rail → click Leçons → grid appears
2. Click lesson card → IDE opens with starter files, dock shows instructions
3. Edit code to pass checkpoints → validation runs, checkpoints animate to "done"
4. Complete all → lesson marked complete
5. Brand click → back to Home, lesson shows ✓
6. Challenges → click challenge → IDE with file ops enabled
7. Quit mid-lesson → reopen → progress restored

- [ ] **Step 3: Final commit + push**

```bash
git push
```
