// @vitest-environment jsdom
import { describe, expect, test } from "vitest";

import { isTypingInField } from "./shortcuts";

describe("isTypingInField", () => {
  test("returns false for null target", () => {
    expect(isTypingInField(null)).toBe(false);
  });

  test("returns true for INPUT element", () => {
    const input = document.createElement("input");
    expect(isTypingInField(input)).toBe(true);
  });

  test("returns true for TEXTAREA element", () => {
    const ta = document.createElement("textarea");
    expect(isTypingInField(ta)).toBe(true);
  });

  test("returns true for SELECT element", () => {
    const sel = document.createElement("select");
    expect(isTypingInField(sel)).toBe(true);
  });

  test("returns true for contenteditable element", () => {
    // jsdom doesn't compute `isContentEditable` reliably; setAttribute makes
    // the backing HTML attribute match what a real browser would see.
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    document.body.appendChild(div);
    expect(isTypingInField(div)).toBe(true);
    document.body.removeChild(div);
  });

  test("returns false for a plain button", () => {
    const btn = document.createElement("button");
    expect(isTypingInField(btn)).toBe(false);
  });

  test("returns false for a plain div", () => {
    const div = document.createElement("div");
    expect(isTypingInField(div)).toBe(false);
  });

  test("returns false for non-HTMLElement targets", () => {
    const target = {} as EventTarget;
    expect(isTypingInField(target)).toBe(false);
  });
});
