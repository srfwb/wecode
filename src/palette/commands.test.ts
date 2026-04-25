import { describe, expect, test } from "vitest";

import { COMMANDS } from "./commands";

describe("COMMANDS registry", () => {
  test("is non-empty", () => {
    expect(COMMANDS.length).toBeGreaterThan(0);
  });

  test("has unique ids", () => {
    const ids = COMMANDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every command has a callable run", () => {
    for (const cmd of COMMANDS) {
      expect(typeof cmd.run).toBe("function");
    }
  });

  test("every command carries a non-empty title", () => {
    for (const cmd of COMMANDS) {
      expect(cmd.title.trim().length).toBeGreaterThan(0);
    }
  });
});
