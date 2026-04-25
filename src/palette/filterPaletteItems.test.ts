import { describe, expect, test } from "vitest";

import { filterPaletteItems } from "./filterPaletteItems";
import type { PaletteItem } from "./types";

function makeItem(partial: Partial<PaletteItem> & Pick<PaletteItem, "id" | "title">): PaletteItem {
  return {
    group: "files",
    icon: { glyph: "·", tone: "blank" },
    onSelect: () => {},
    ...partial,
  };
}

describe("filterPaletteItems", () => {
  test("returns the full input when the query is empty or whitespace", () => {
    const items = [makeItem({ id: "a", title: "Alpha" }), makeItem({ id: "b", title: "Bravo" })];
    expect(filterPaletteItems(items, "")).toEqual(items);
    expect(filterPaletteItems(items, "   ")).toEqual(items);
  });

  test("drops items with no match", () => {
    const items = [makeItem({ id: "a", title: "Alpha" }), makeItem({ id: "b", title: "Bravo" })];
    expect(filterPaletteItems(items, "zz")).toEqual([]);
  });

  test("is case insensitive", () => {
    const items = [makeItem({ id: "a", title: "INDEX.html" })];
    expect(filterPaletteItems(items, "ind")).toHaveLength(1);
    expect(filterPaletteItems(items, "INDEX")).toHaveLength(1);
  });

  test("title prefix ranks above title substring", () => {
    const items = [
      makeItem({ id: "mid", title: "ready-steady-go" }),
      makeItem({ id: "pre", title: "steady-state" }),
    ];
    const result = filterPaletteItems(items, "steady");
    expect(result.map((i) => i.id)).toEqual(["pre", "mid"]);
  });

  test("title substring ranks above subtitle substring", () => {
    const items = [
      makeItem({ id: "sub", title: "projet", subtitle: "contient index" }),
      makeItem({ id: "title", title: "index.html" }),
    ];
    const result = filterPaletteItems(items, "index");
    expect(result.map((i) => i.id)).toEqual(["title", "sub"]);
  });

  test("preserves input order for ties (stable sort)", () => {
    const items = [
      makeItem({ id: "first", title: "alpha" }),
      makeItem({ id: "second", title: "alpha-two" }),
      makeItem({ id: "third", title: "alpha-three" }),
    ];
    const result = filterPaletteItems(items, "alpha");
    expect(result.map((i) => i.id)).toEqual(["first", "second", "third"]);
  });

  test("respects an explicit searchTokens override", () => {
    const items = [
      makeItem({
        id: "with-tokens",
        title: "Nothing visible",
        searchTokens: "hidden-needle",
      }),
    ];
    expect(filterPaletteItems(items, "needle")).toHaveLength(1);
  });
});
