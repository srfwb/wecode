import { extname } from "../../vfs/paths";

const LANGUAGE_BY_EXT: Record<string, string> = {
  ".html": "HTML",
  ".htm": "HTML",
  ".css": "CSS",
  ".js": "JavaScript",
  ".mjs": "JavaScript",
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".json": "JSON",
  ".md": "Markdown",
  ".svg": "SVG",
};

export function languageLabel(path: string | null): string {
  if (!path) return "Texte";
  return LANGUAGE_BY_EXT[extname(path).toLowerCase()] ?? "Texte";
}

// Humanise a saved-at timestamp against `now` in French. Granularity steps
// up (seconds → minutes → hours) to keep the chip short and avoid lying by
// being too precise when the autosave is stale.
export function formatSavedAgo(at: number | null, now: number): string {
  if (at === null) return "Sauvegarde auto";
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 2) return "Sauvegardé à l'instant";
  if (seconds < 60) return `Sauvegardé il y a ${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Sauvegardé il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `Sauvegardé il y a ${hours} h`;
}
