import { useEffect } from "react";

import { useIdeStore } from "../state/ideStore";
import { usePaletteStore } from "./paletteStore";

// App-wide Cmd/Ctrl+K listener. Lives outside `useGlobalShortcuts` (which is
// IDE-scoped) because the palette is Home-only — the guard on
// `view === "home"` is read live on every event, not captured at mount.
export function useCommandPaletteShortcut(): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key !== "k" && event.key !== "K") return;
      if (useIdeStore.getState().view !== "home") return;
      event.preventDefault();
      usePaletteStore.getState().toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);
}
