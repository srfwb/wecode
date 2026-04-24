import type { PaletteItem } from "./types";

// Rank buckets — lower is better (we use Array.prototype.sort stable order).
const RANK_TITLE_PREFIX = 0;
const RANK_TITLE_SUBSTR = 1;
const RANK_SUB_SUBSTR = 2;
const RANK_MISS = 3;

function haystack(item: PaletteItem): string {
  return (item.searchTokens ?? `${item.title} ${item.subtitle ?? ""}`).toLowerCase();
}

function rankOf(item: PaletteItem, needle: string): number {
  const title = item.title.toLowerCase();
  if (title.startsWith(needle)) return RANK_TITLE_PREFIX;
  if (title.includes(needle)) return RANK_TITLE_SUBSTR;
  const sub = (item.subtitle ?? "").toLowerCase();
  if (sub.includes(needle)) return RANK_SUB_SUBSTR;
  if (haystack(item).includes(needle)) return RANK_SUB_SUBSTR;
  return RANK_MISS;
}

// Case-insensitive substring filter with a light three-tier ranking so that
// title matches surface above subtitle matches. Pure function — safe to call
// from a render without memoisation for reasonable list sizes.
export function filterPaletteItems(items: PaletteItem[], query: string): PaletteItem[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") return items;

  const ranked: Array<{ item: PaletteItem; rank: number; index: number }> = [];
  items.forEach((item, index) => {
    const rank = rankOf(item, needle);
    if (rank === RANK_MISS) return;
    ranked.push({ item, rank, index });
  });

  ranked.sort((a, b) => (a.rank === b.rank ? a.index - b.index : a.rank - b.rank));
  return ranked.map((r) => r.item);
}
