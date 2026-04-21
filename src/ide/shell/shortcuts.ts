import { useEffect } from "react";

import { useIdeStore } from "../../state/ideStore";

/** Pub/sub bus for shortcuts that need a UI-local handler (e.g. opening the new-file modal inside `FileTree`). */
export const shortcutEvents = new EventTarget();

export const SHORTCUT_NEW_FILE = "shortcut:new-file";

function cycleTab(step: 1 | -1): void {
  const { openFiles, activeFile, setActiveFile } = useIdeStore.getState();
  if (openFiles.length === 0) return;
  const current = activeFile ? openFiles.indexOf(activeFile) : -1;
  const n = openFiles.length;
  const nextIndex = (current + step + n) % n;
  const nextPath = openFiles[nextIndex];
  if (nextPath !== undefined) setActiveFile(nextPath);
}

export function useGlobalShortcuts(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (e.key === "w" || e.key === "W") {
        const { activeFile, closeFile } = useIdeStore.getState();
        if (activeFile) {
          e.preventDefault();
          closeFile(activeFile);
        }
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        shortcutEvents.dispatchEvent(new Event(SHORTCUT_NEW_FILE));
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        cycleTab(e.shiftKey ? -1 : 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
