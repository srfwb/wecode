import { shortcutLabel } from "../../palette/formatShortcut";
import { usePaletteStore } from "../../palette/paletteStore";
import { IconSearch } from "../icons";

export function HomeSearch() {
  const openPalette = usePaletteStore((s) => s.openPalette);
  const paletteOpen = usePaletteStore((s) => s.open);

  return (
    <div
      className="home-search"
      role="search"
      onClick={openPalette}
      style={paletteOpen ? { visibility: "hidden" } : undefined}
    >
      <IconSearch />
      <input
        type="text"
        placeholder="Search projects, lessons, or open a file…"
        aria-label="Search"
        readOnly
        tabIndex={-1}
      />
      <span className="home-search-kbd">{shortcutLabel("K")}</span>
    </div>
  );
}
