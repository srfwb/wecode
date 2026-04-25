import { useEffect, useRef } from "react";

import { shortcutLabel } from "../../palette/formatShortcut";
import { usePaletteStore } from "../../palette/paletteStore";
import { IconSearch } from "../icons";

// After the palette closes, `useModalA11y` restores focus to whatever element
// had it before the palette opened — which is this input. Without a guard the
// `onFocus` would immediately reopen the palette, creating a
// open → close → focus-restore → reopen loop (visible as a micro-freeze).
// We debounce by recording the last close timestamp and ignoring focus events
// that arrive within a short window.
const REOPEN_GUARD_MS = 200;

export function HomeSearch() {
  const openPalette = usePaletteStore((s) => s.openPalette);
  const paletteOpen = usePaletteStore((s) => s.open);
  const lastCloseRef = useRef(0);

  useEffect(() => {
    // When the palette transitions from open → closed, note the timestamp.
    if (!paletteOpen) {
      lastCloseRef.current = Date.now();
    }
  }, [paletteOpen]);

  const guardedOpen = () => {
    if (Date.now() - lastCloseRef.current < REOPEN_GUARD_MS) return;
    openPalette();
  };

  return (
    <div className="home-search" role="search" onClick={guardedOpen}>
      <IconSearch />
      <input
        type="text"
        placeholder="Rechercher un projet, une leçon ou ouvrir un fichier…"
        aria-label="Rechercher"
        readOnly
        onFocus={guardedOpen}
      />
      <span className="home-search-kbd">{shortcutLabel("K")}</span>
    </div>
  );
}
