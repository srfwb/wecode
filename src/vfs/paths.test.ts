import { describe, expect, it } from "vitest";

import { basename, dirname, extname, normalize } from "./paths";

describe("paths.normalize", () => {
  it("prefixes a leading slash when missing", () => {
    expect(normalize("index.html")).toBe("/index.html");
  });

  it("keeps an existing leading slash", () => {
    expect(normalize("/css/style.css")).toBe("/css/style.css");
  });

  it("collapses repeated slashes", () => {
    expect(normalize("//foo///bar.txt")).toBe("/foo/bar.txt");
  });

  it("trims trailing slashes except at root", () => {
    expect(normalize("/foo/bar/")).toBe("/foo/bar");
  });

  it("rejects empty input", () => {
    expect(() => normalize("")).toThrow(/must not be empty/);
  });

  it("rejects dot and dot-dot segments", () => {
    expect(() => normalize("/a/./b")).toThrow(/invalid path segment/);
    expect(() => normalize("/a/../b")).toThrow(/invalid path segment/);
  });

  it("rejects forbidden characters", () => {
    for (const bad of ["\\", ":", "*", "?", '"', "<", ">", "|"]) {
      expect(() => normalize(`/foo${bad}bar.txt`)).toThrow(/forbidden character/);
    }
  });

  it("rejects control characters", () => {
    expect(() => normalize("/foo\x00bar")).toThrow(/forbidden character/);
  });
});

describe("paths.basename / dirname / extname", () => {
  it("extracts the final segment", () => {
    expect(basename("/foo/bar.txt")).toBe("bar.txt");
    expect(basename("/index.html")).toBe("index.html");
  });

  it("returns the parent path or root", () => {
    expect(dirname("/foo/bar.txt")).toBe("/foo");
    expect(dirname("/index.html")).toBe("/");
  });

  it("reports the extension with the dot", () => {
    expect(extname("/index.html")).toBe(".html");
    expect(extname("/foo/bar.tar.gz")).toBe(".gz");
  });

  it("returns empty extension for files without a suffix or leading-dot files", () => {
    expect(extname("/Makefile")).toBe("");
    expect(extname("/.env")).toBe("");
  });
});
