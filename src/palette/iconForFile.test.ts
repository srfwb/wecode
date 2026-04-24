import { describe, expect, test } from "vitest";

import { iconForFile } from "./iconForFile";

describe("iconForFile", () => {
  test("maps html extensions to the html tone", () => {
    expect(iconForFile("/index.html")).toEqual({ glyph: "◇", tone: "html" });
    expect(iconForFile("/about.htm")).toEqual({ glyph: "◇", tone: "html" });
  });

  test("maps css extensions to the css tone", () => {
    expect(iconForFile("/style.css")).toEqual({ glyph: "#", tone: "css" });
  });

  test("maps js / mjs extensions to the js tone", () => {
    expect(iconForFile("/main.js")).toEqual({ glyph: "JS", tone: "js" });
    expect(iconForFile("/module.mjs")).toEqual({ glyph: "JS", tone: "js" });
  });

  test("is case insensitive on the extension", () => {
    expect(iconForFile("/UPPER.HTML")).toEqual({ glyph: "◇", tone: "html" });
  });

  test("falls back to the blank tone for unknown extensions", () => {
    expect(iconForFile("/notes.md")).toEqual({ glyph: "·", tone: "blank" });
    expect(iconForFile("/data.json")).toEqual({ glyph: "·", tone: "blank" });
    expect(iconForFile("/no-extension")).toEqual({ glyph: "·", tone: "blank" });
  });
});
