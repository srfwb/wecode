import { useEffect } from "react";

import { useIdeStore } from "../../state/ideStore";

/** Pub/sub bus for shortcuts that need a UI-local handler (e.g. opening the new-file modal inside `FileTree`). */
export const shortcutEvents = new EventTarget();

export const SHORTCUT_NEW_FILE = "shortcut:new-file";

function cycleTab(step: 1 | -1): void {
  // Compute the next path inside the zustand set callback so the read of
  // openFiles and the write of activeFile happen on a single consistent
  // snapshot — otherwise a listener reacting to `openFiles` could mutate
  // the store between our read and write.
  useIdeStore.setState((state) => {
    if (state.openFiles.length === 0) return state;
    const current = state.activeFile ? state.openFiles.indexOf(state.activeFile) : -1;
    const n = state.openFiles.length;
    const nextIndex = (current + step + n) % n;
    const nextPath = state.openFiles[nextIndex];
    if (nextPath === undefined || nextPath === state.activeFile) return state;
    return { ...state, activeFile: nextPath };
  });
}

// Shortcut events fired while the user is typing in a field, composing an IME
// sequence, or editing code in CodeMirror should not be hijacked by the
// global shortcut handler — the keystroke "belongs" to the input. The
// CodeMirror editor uses contenteditable, so we check both the computed
// `isContentEditable` (real browsers) and the `contenteditable` attribute
// (jsdom does not compute `isContentEditable` for detached/standalone nodes).
// Exported for unit testing.
export function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  const attr = target.getAttribute("contenteditable");
  return attr === "" || attr === "true" || attr === "plaintext-only";
}

export function useGlobalShortcuts(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const view = useIdeStore.getState().view;
      if (view !== "ide" && view !== "lesson") return;
      if (e.isComposing) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (e.key === "w" || e.key === "W") {
        // Closing a tab with Ctrl+W while the user is editing inside the
        // editor or a modal input would yank the document out from under them.
        if (isTypingInField(e.target)) return;
        const { activeFile, closeFile } = useIdeStore.getState();
        if (activeFile) {
          e.preventDefault();
          closeFile(activeFile);
        }
        return;
      }

      if (e.key === "n" || e.key === "N") {
        if (isTypingInField(e.target)) return;
        if (view === "lesson") return;
        e.preventDefault();
        shortcutEvents.dispatchEvent(new Event(SHORTCUT_NEW_FILE));
        return;
      }

      if (e.key === "Tab") {
        // Ctrl+Tab cycles editor tabs even when the editor has focus — that
        // is the canonical IDE behaviour and the user expects it.
        e.preventDefault();
        cycleTab(e.shiftKey ? -1 : 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
