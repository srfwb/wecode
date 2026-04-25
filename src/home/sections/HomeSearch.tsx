import { shortcutLabel } from "../../palette/formatShortcut";
import { usePaletteStore } from "../../palette/paletteStore";
import { IconSearch } from "../icons";

export function HomeSearch() {
  const openPalette = usePaletteStore((s) => s.openPalette);

  return (
    <div className="home-search" role="search" onClick={openPalette}>
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
