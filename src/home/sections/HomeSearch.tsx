import { useRef } from "react";

import { shortcutLabel } from "../../palette/formatShortcut";
import { usePaletteStore } from "../../palette/paletteStore";
import { IconSearch } from "../icons";

export function HomeSearch() {
  const openPalette = usePaletteStore((s) => s.openPalette);
  const paletteOpen = usePaletteStore((s) => s.open);
  const barRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    // Measure where the search bar sits so the palette can animate from
    // that exact position — the FLIP technique. Custom properties are set
    // on <html> and consumed by @keyframes palette-enter in global.css.
    const rect = barRef.current?.getBoundingClientRect();
    if (rect) {
      const root = document.documentElement;
      const paletteTop = 88; // palette resting position (CSS `top: 88px`)
      const paletteCenterX = window.innerWidth / 2;
      const paletteWidth = Math.min(720, window.innerWidth - 48);

      root.style.setProperty("--palette-dy", `${rect.top - paletteTop}px`);
      root.style.setProperty("--palette-dx", `${rect.left + rect.width / 2 - paletteCenterX}px`);
      root.style.setProperty("--palette-sx", `${rect.width / paletteWidth}`);
    }
    openPalette();
  };

  return (
    <div
      ref={barRef}
      className="home-search"
      role="search"
      onClick={handleClick}
      style={paletteOpen ? { visibility: "hidden" } : undefined}
    >
      <IconSearch />
      <input
        type="text"
        placeholder="Rechercher un projet, une leçon ou ouvrir un fichier…"
        aria-label="Rechercher"
        readOnly
        tabIndex={-1}
      />
      <span className="home-search-kbd">{shortcutLabel("K")}</span>
    </div>
  );
}
