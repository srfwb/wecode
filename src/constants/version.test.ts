import { describe, expect, test } from "vitest";

import { APP_VERSION } from "./version";

describe("APP_VERSION", () => {
  test("is a non-empty string", () => {
    expect(typeof APP_VERSION).toBe("string");
    expect(APP_VERSION.length).toBeGreaterThan(0);
  });

  test("starts with the v prefix so it matches the tag convention", () => {
    expect(APP_VERSION.startsWith("v")).toBe(true);
  });

  test("contains at least one dot separating version segments", () => {
    expect(APP_VERSION).toMatch(/^v\d+\.\d+\.\d+/);
  });
});
