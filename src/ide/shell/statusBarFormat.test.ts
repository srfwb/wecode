import { describe, expect, test } from "vitest";

import { formatSavedAgo, languageLabel } from "./statusBarFormat";

describe("languageLabel", () => {
  test("returns Text for null path", () => {
    expect(languageLabel(null)).toBe("Text");
  });

  test("recognises common web extensions", () => {
    expect(languageLabel("/app.html")).toBe("HTML");
    expect(languageLabel("/styles.css")).toBe("CSS");
    expect(languageLabel("/main.js")).toBe("JavaScript");
    expect(languageLabel("/app.tsx")).toBe("TypeScript");
  });

  test("is case-insensitive for extensions", () => {
    expect(languageLabel("/UPPER.HTML")).toBe("HTML");
  });

  test("falls back to Text for unknown extensions", () => {
    expect(languageLabel("/foo.bar")).toBe("Text");
    expect(languageLabel("/noext")).toBe("Text");
  });
});

describe("formatSavedAgo", () => {
  const NOW = 1_000_000_000_000;

  test("returns a placeholder when no timestamp is known", () => {
    expect(formatSavedAgo(null, NOW)).toBe("Auto-save");
  });

  test("returns 'just now' for very fresh saves", () => {
    expect(formatSavedAgo(NOW, NOW)).toBe("Saved just now");
    expect(formatSavedAgo(NOW - 500, NOW)).toBe("Saved just now");
  });

  test("returns seconds for saves less than a minute old", () => {
    expect(formatSavedAgo(NOW - 5_000, NOW)).toBe("Saved 5s ago");
    expect(formatSavedAgo(NOW - 45_000, NOW)).toBe("Saved 45s ago");
  });

  test("returns minutes for saves less than an hour old", () => {
    expect(formatSavedAgo(NOW - 60_000, NOW)).toBe("Saved 1m ago");
    expect(formatSavedAgo(NOW - 30 * 60_000, NOW)).toBe("Saved 30m ago");
  });

  test("returns hours for saves older than an hour", () => {
    expect(formatSavedAgo(NOW - 60 * 60_000, NOW)).toBe("Saved 1h ago");
    expect(formatSavedAgo(NOW - 3 * 60 * 60_000, NOW)).toBe("Saved 3h ago");
  });

  test("never returns a negative delta when the timestamp is in the future", () => {
    expect(formatSavedAgo(NOW + 5_000, NOW)).toBe("Saved just now");
  });
});
