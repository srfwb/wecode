import { beforeEach, describe, expect, it } from "vitest";

import { renameProject } from "./actions";
import { useProjectStore } from "./projectStore";
import type { ProjectMeta } from "./types";

function meta(id: string, name: string): ProjectMeta {
  return {
    id,
    name,
    path: `/tmp/${id}`,
    kind: "html",
    tags: [],
    createdAt: 0,
    lastOpenedAt: 0,
    fileCount: 0,
    lineCount: 0,
  };
}

describe("renameProject", () => {
  beforeEach(() => {
    useProjectStore.setState({ projects: [], activeProjectId: null });
  });

  it("updates the project name in the store", () => {
    useProjectStore
      .getState()
      .hydrate({ version: 1, projects: [meta("a", "old")], activeProjectId: "a" });
    renameProject("a", "brand new");
    expect(useProjectStore.getState().projects[0]!.name).toBe("brand new");
  });

  it("trims whitespace in the new name", () => {
    useProjectStore
      .getState()
      .hydrate({ version: 1, projects: [meta("a", "old")], activeProjectId: null });
    renameProject("a", "   spaced   ");
    expect(useProjectStore.getState().projects[0]!.name).toBe("spaced");
  });

  it("throws on unknown project id", () => {
    expect(() => renameProject("missing", "whatever")).toThrow(/unknown project/);
  });

  it("throws on invalid names", () => {
    useProjectStore
      .getState()
      .hydrate({ version: 1, projects: [meta("a", "old")], activeProjectId: null });
    expect(() => renameProject("a", "")).toThrow();
    expect(() => renameProject("a", "bad/name")).toThrow();
  });

  it("is a no-op when the name is unchanged", () => {
    useProjectStore
      .getState()
      .hydrate({ version: 1, projects: [meta("a", "same")], activeProjectId: null });
    renameProject("a", "same");
    expect(useProjectStore.getState().projects[0]!.name).toBe("same");
  });
});
