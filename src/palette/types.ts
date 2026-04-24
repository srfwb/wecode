// One row in the palette dropdown — a project to open, a file to load, a
// command to run, etc. Sources produce these and the overlay renders them.
export interface PaletteItem {
  /** Stable per-render identifier used for selection state and React keys. */
  id: string;
  /** Group bucket (e.g. "Jump back in", "Files", "Commands"). */
  group: PaletteGroupKey;
  /** Main title — what the user reads first. */
  title: string;
  /** Optional secondary text shown muted to the right of the title. */
  subtitle?: string;
  /** Short label for the type pill on the right (e.g. "file", "project"). */
  pill?: string;
  /** Two-letter glyph and tone for the leading icon. */
  icon: { glyph: string; tone: PaletteIconTone };
  /** Lower-case haystack used by the filter — defaults to title + subtitle. */
  searchTokens?: string;
  /** Triggered when the user picks the row (Enter or click). */
  onSelect: () => void | Promise<void>;
}

export type PaletteGroupKey = "jump" | "files" | "commands" | "lessons";

export interface PaletteGroup {
  key: PaletteGroupKey;
  label: string;
  items: PaletteItem[];
}

// Order groups appear in the palette body — matches the Claude Design handoff.
export const PALETTE_GROUP_ORDER: readonly PaletteGroupKey[] = [
  "jump",
  "files",
  "commands",
  "lessons",
];

// Centralised user-facing labels (French). Keep in one place so the overlay
// and the tests can agree.
export const PALETTE_GROUP_LABELS: Record<PaletteGroupKey, string> = {
  jump: "Reprendre",
  files: "Fichiers",
  commands: "Commandes",
  lessons: "Leçons",
};

// Soft palette shared with project cards / template cards so glyphs read at a
// glance. New entries can extend this union.
export type PaletteIconTone = "html" | "css" | "js" | "game" | "blank" | "cmd" | "lesson";
