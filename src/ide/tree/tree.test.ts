import { describe, expect, it } from "vitest";

import { buildTree } from "./tree";

describe("buildTree", () => {
  it("returns an empty array for an empty input", () => {
    expect(buildTree([])).toEqual([]);
  });

  it("builds a flat list of files at root", () => {
    const tree = buildTree(["/index.html", "/style.css"]);
    expect(tree).toEqual([
      { type: "file", name: "index.html", path: "/index.html" },
      { type: "file", name: "style.css", path: "/style.css" },
    ]);
  });

  it("groups files under implicit folders", () => {
    const tree = buildTree(["/assets/logo.svg", "/index.html"]);
    expect(tree).toHaveLength(2);
    expect(tree[0]).toMatchObject({ type: "folder", name: "assets", path: "/assets" });
    expect(tree[1]).toMatchObject({ type: "file", name: "index.html" });
  });

  it("places folders before files at each level", () => {
    const tree = buildTree(["/z-file.txt", "/a-folder/leaf.txt"]);
    expect(tree[0]).toMatchObject({ type: "folder", name: "a-folder" });
    expect(tree[1]).toMatchObject({ type: "file", name: "z-file.txt" });
  });

  it("sorts alphabetically within each group", () => {
    const tree = buildTree(["/b.txt", "/a.txt", "/c.txt"]);
    expect(tree.map((n) => n.name)).toEqual(["a.txt", "b.txt", "c.txt"]);
  });

  it("nests deep paths correctly", () => {
    const tree = buildTree(["/a/b/c/file.txt"]);
    const a = tree[0];
    expect(a?.type).toBe("folder");
    if (a?.type !== "folder") return;
    const b = a.children[0];
    expect(b?.type).toBe("folder");
    if (b?.type !== "folder") return;
    const c = b.children[0];
    expect(c).toMatchObject({
      type: "folder",
      name: "c",
      path: "/a/b/c",
    });
  });
});
