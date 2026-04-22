import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "./relativeTime";

const NOW = Date.UTC(2026, 3, 22, 12, 0, 0);

describe("formatRelativeTime", () => {
  it("returns 'à l'instant' for any diff under a minute", () => {
    expect(formatRelativeTime(NOW - 30_000, NOW)).toBe("à l'instant");
    expect(formatRelativeTime(NOW - 500, NOW)).toBe("à l'instant");
  });

  it("uses minutes between one minute and one hour", () => {
    expect(formatRelativeTime(NOW - 5 * 60_000, NOW)).toBe("il y a 5 min");
    expect(formatRelativeTime(NOW - 59 * 60_000, NOW)).toBe("il y a 59 min");
  });

  it("uses hours between one hour and one day", () => {
    expect(formatRelativeTime(NOW - 3 * 60 * 60_000, NOW)).toBe("il y a 3 h");
  });

  it("returns 'hier' between 1 and 2 days", () => {
    expect(formatRelativeTime(NOW - 25 * 60 * 60_000, NOW)).toBe("hier");
  });

  it("uses days between 2 and 7 days", () => {
    expect(formatRelativeTime(NOW - 3 * 24 * 60 * 60_000, NOW)).toBe("il y a 3 j");
  });

  it("formats as a date beyond a week", () => {
    const eightDaysAgo = NOW - 8 * 24 * 60 * 60_000;
    const formatted = formatRelativeTime(eightDaysAgo, NOW);
    expect(formatted).toMatch(/avr/);
  });

  it("clamps negative diffs (future timestamps) to 'à l'instant'", () => {
    expect(formatRelativeTime(NOW + 1000, NOW)).toBe("à l'instant");
  });
});
