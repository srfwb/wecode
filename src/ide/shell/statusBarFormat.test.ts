import { describe, expect, test } from "vitest";

import { formatSavedAgo, languageLabel } from "./statusBarFormat";

describe("languageLabel", () => {
  test("returns Texte for null path", () => {
    expect(languageLabel(null)).toBe("Texte");
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

  test("falls back to Texte for unknown extensions", () => {
    expect(languageLabel("/foo.bar")).toBe("Texte");
    expect(languageLabel("/noext")).toBe("Texte");
  });
});

describe("formatSavedAgo", () => {
  const NOW = 1_000_000_000_000;

  test("returns a placeholder when no timestamp is known", () => {
    expect(formatSavedAgo(null, NOW)).toBe("Sauvegarde auto");
  });

  test("returns 'à l'instant' for very fresh saves", () => {
    expect(formatSavedAgo(NOW, NOW)).toBe("Sauvegardé à l'instant");
    expect(formatSavedAgo(NOW - 500, NOW)).toBe("Sauvegardé à l'instant");
  });

  test("returns seconds for saves less than a minute old", () => {
    expect(formatSavedAgo(NOW - 5_000, NOW)).toBe("Sauvegardé il y a 5 s");
    expect(formatSavedAgo(NOW - 45_000, NOW)).toBe("Sauvegardé il y a 45 s");
  });

  test("returns minutes for saves less than an hour old", () => {
    expect(formatSavedAgo(NOW - 60_000, NOW)).toBe("Sauvegardé il y a 1 min");
    expect(formatSavedAgo(NOW - 30 * 60_000, NOW)).toBe("Sauvegardé il y a 30 min");
  });

  test("returns hours for saves older than an hour", () => {
    expect(formatSavedAgo(NOW - 60 * 60_000, NOW)).toBe("Sauvegardé il y a 1 h");
    expect(formatSavedAgo(NOW - 3 * 60 * 60_000, NOW)).toBe("Sauvegardé il y a 3 h");
  });

  test("never returns a negative delta when the timestamp is in the future", () => {
    expect(formatSavedAgo(NOW + 5_000, NOW)).toBe("Sauvegardé à l'instant");
  });
});
