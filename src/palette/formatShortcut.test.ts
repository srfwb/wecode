import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { isMacPlatform, modifierLabel, shortcutLabel } from "./formatShortcut";

// `navigator.platform` is a runtime string (`"MacIntel"`, `"Win32"`,
// `"Linux x86_64"`). We stub it per test and restore the original in
// `afterEach` so the suite is order-independent.
const globalNavigator = globalThis.navigator as Navigator | undefined;
const originalPlatform = globalNavigator?.platform;

function stubPlatform(value: string): void {
  if (!globalNavigator) {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { platform: value },
    });
    return;
  }
  Object.defineProperty(globalNavigator, "platform", {
    configurable: true,
    value,
  });
}

describe("formatShortcut helpers", () => {
  beforeEach(() => {
    stubPlatform("Win32");
  });

  afterEach(() => {
    stubPlatform(originalPlatform ?? "");
  });

  test("isMacPlatform returns true on MacIntel", () => {
    stubPlatform("MacIntel");
    expect(isMacPlatform()).toBe(true);
  });

  test("isMacPlatform returns true on macOS userAgent variants", () => {
    stubPlatform("Mac68K");
    expect(isMacPlatform()).toBe(true);
  });

  test("isMacPlatform returns false on Win32", () => {
    stubPlatform("Win32");
    expect(isMacPlatform()).toBe(false);
  });

  test("isMacPlatform returns false on Linux", () => {
    stubPlatform("Linux x86_64");
    expect(isMacPlatform()).toBe(false);
  });

  test("modifierLabel returns ⌘ on Mac and Ctrl elsewhere", () => {
    stubPlatform("MacIntel");
    expect(modifierLabel()).toBe("⌘");
    stubPlatform("Win32");
    expect(modifierLabel()).toBe("Ctrl");
  });

  test("shortcutLabel uppercases the key and uses the right modifier", () => {
    stubPlatform("MacIntel");
    expect(shortcutLabel("k")).toBe("⌘K");
    stubPlatform("Win32");
    expect(shortcutLabel("k")).toBe("Ctrl K");
  });
});
