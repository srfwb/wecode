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
  if (!path) return "Text";
  return LANGUAGE_BY_EXT[extname(path).toLowerCase()] ?? "Text";
}

// Humanise a saved-at timestamp against `now`. Granularity steps
// up (seconds → minutes → hours) to keep the chip short and avoid lying by
// being too precise when the autosave is stale.
export function formatSavedAgo(at: number | null, now: number): string {
  if (at === null) return "Auto-save";
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 2) return "Saved just now";
  if (seconds < 60) return `Saved ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Saved ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `Saved ${hours}h ago`;
}
