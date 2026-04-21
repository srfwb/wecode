import { describe, expect, it, vi } from "vitest";

import type { VFSChange } from "./events";
import { VirtualFS } from "./VirtualFS";

describe("VirtualFS", () => {
  it("creates, reads and writes files", () => {
    const fs = new VirtualFS();
    fs.createFile("/a.txt", "hello");
    expect(fs.readFile("/a.txt")).toBe("hello");
    fs.writeFile("/a.txt", "world");
    expect(fs.readFile("/a.txt")).toBe("world");
  });

  it("returns null for unknown paths", () => {
    const fs = new VirtualFS();
    expect(fs.readFile("/missing.txt")).toBeNull();
  });

  it("rejects creating an existing file", () => {
    const fs = new VirtualFS();
    fs.createFile("/a.txt");
    expect(() => fs.createFile("/a.txt")).toThrow(/already exists/);
  });

  it("deletes files", () => {
    const fs = new VirtualFS();
    fs.createFile("/a.txt");
    fs.deleteFile("/a.txt");
    expect(fs.readFile("/a.txt")).toBeNull();
  });

  it("rejects deleting a missing file", () => {
    const fs = new VirtualFS();
    expect(() => fs.deleteFile("/missing.txt")).toThrow(/file not found/);
  });

  it("renames files preserving content", () => {
    const fs = new VirtualFS();
    fs.createFile("/old.txt", "keep");
    fs.renameFile("/old.txt", "/new.txt");
    expect(fs.readFile("/old.txt")).toBeNull();
    expect(fs.readFile("/new.txt")).toBe("keep");
  });

  it("rejects rename when target already exists", () => {
    const fs = new VirtualFS();
    fs.createFile("/a.txt");
    fs.createFile("/b.txt");
    expect(() => fs.renameFile("/a.txt", "/b.txt")).toThrow(/target already exists/);
  });

  it("lists files sorted", () => {
    const fs = new VirtualFS();
    fs.createFile("/z.txt");
    fs.createFile("/a.txt");
    fs.createFile("/m.txt");
    expect(fs.listFiles()).toEqual(["/a.txt", "/m.txt", "/z.txt"]);
  });

  it("emits change events on create, write, delete, rename", () => {
    const fs = new VirtualFS();
    const spy = vi.fn<(c: VFSChange) => void>();
    fs.on("change", spy);

    fs.createFile("/a.txt", "x");
    fs.writeFile("/a.txt", "y");
    fs.renameFile("/a.txt", "/b.txt");
    fs.deleteFile("/b.txt");

    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy).toHaveBeenNthCalledWith(1, { kind: "create", path: "/a.txt" });
    expect(spy).toHaveBeenNthCalledWith(2, { kind: "write", path: "/a.txt" });
    expect(spy).toHaveBeenNthCalledWith(3, { kind: "rename", path: "/b.txt", oldPath: "/a.txt" });
    expect(spy).toHaveBeenNthCalledWith(4, { kind: "delete", path: "/b.txt" });
  });

  it("stops firing after unsubscribe", () => {
    const fs = new VirtualFS();
    const spy = vi.fn();
    const off = fs.on("change", spy);
    fs.createFile("/a.txt");
    off();
    fs.writeFile("/a.txt", "new");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("hydrates silently from a snapshot without firing events", () => {
    const fs = new VirtualFS();
    const spy = vi.fn();
    fs.on("change", spy);
    fs.hydrate({ "/a.txt": "A", "/b.txt": "B" });
    expect(fs.listFiles()).toEqual(["/a.txt", "/b.txt"]);
    expect(spy).not.toHaveBeenCalled();
  });
});
