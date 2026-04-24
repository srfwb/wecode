import type { ReactNode } from "react";

// Return the `text` split into prefix / <mark>match</mark> / suffix around the
// first case-insensitive occurrence of `query`. Original casing is preserved
// (we slice the input, we don't lowercase it). When there's no match or the
// query is empty the result is a single-element array containing the raw text
// so the caller can render it uniformly.
export function highlightMatch(text: string, query: string): ReactNode[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") return [text];
  const haystack = text.toLowerCase();
  const index = haystack.indexOf(needle);
  if (index === -1) return [text];
  const prefix = text.slice(0, index);
  const match = text.slice(index, index + needle.length);
  const suffix = text.slice(index + needle.length);
  return [prefix, <mark key="m">{match}</mark>, suffix];
}
