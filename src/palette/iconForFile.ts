import type { PaletteIconTone } from "./types";

// Pick a glyph + tone for a VFS path based on its extension. Kept minimal on
// purpose — the palette only highlights the handful of languages WeCode
// actively supports; anything else falls back to a neutral dot.
export function iconForFile(path: string): { glyph: string; tone: PaletteIconTone } {
  const ext = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  switch (ext) {
    case "html":
    case "htm":
      return { glyph: "◇", tone: "html" };
    case "css":
      return { glyph: "#", tone: "css" };
    case "js":
    case "mjs":
      return { glyph: "JS", tone: "js" };
    default:
      return { glyph: "·", tone: "blank" };
  }
}
