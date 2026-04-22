import { beforeEach, describe, expect, it } from "vitest";

import { useProjectStore } from "./projectStore";
import type { ProjectMeta } from "./types";

function meta(id: string, extra?: Partial<ProjectMeta>): ProjectMeta {
  return {
    id,
    name: id,
    path: `/tmp/${id}`,
    kind: "html",
    tags: [],
    createdAt: 0,
    lastOpenedAt: 0,
    fileCount: 0,
    lineCount: 0,
    ...extra,
  };
}

describe("useProjectStore", () => {
  beforeEach(() => {
    useProjectStore.setState({ projects: [], activeProjectId: null });
  });

  it("starts with an empty list and no active project", () => {
    const state = useProjectStore.getState();
    expect(state.projects).toEqual([]);
    expect(state.activeProjectId).toBeNull();
  });

  it("hydrates projects and active id", () => {
    useProjectStore
      .getState()
      .hydrate({ version: 1, projects: [meta("a"), meta("b")], activeProjectId: "b" });
    const state = useProjectStore.getState();
    expect(state.projects.map((p) => p.id)).toEqual(["a", "b"]);
    expect(state.activeProjectId).toBe("b");
  });

  it("setActive without touch leaves lastOpenedAt intact", () => {
    useProjectStore
      .getState()
      .hydrate({ version: 1, projects: [meta("a")], activeProjectId: null });
    useProjectStore.getState().setActive("a");
    const state = useProjectStore.getState();
    expect(state.activeProjectId).toBe("a");
    expect(state.projects[0]!.lastOpenedAt).toBe(0);
  });

  it("setActive with touch bumps lastOpenedAt", () => {
    useProjectStore
      .getState()
      .hydrate({ version: 1, projects: [meta("a")], activeProjectId: null });
    const before = Date.now();
    useProjectStore.getState().setActive("a", { touch: true });
    const state = useProjectStore.getState();
    expect(state.projects[0]!.lastOpenedAt).toBeGreaterThanOrEqual(before);
  });

  it("upsert adds a new project and replaces an existing one", () => {
    useProjectStore.getState().upsert(meta("a", { name: "alpha" }));
    useProjectStore.getState().upsert(meta("b", { name: "beta" }));
    useProjectStore.getState().upsert(meta("a", { name: "alpha-v2" }));
    const state = useProjectStore.getState();
    expect(state.projects.map((p) => p.name).sort()).toEqual(["alpha-v2", "beta"]);
  });

  it("patchStats updates fileCount and lineCount for a single project", () => {
    useProjectStore
      .getState()
      .hydrate({ version: 1, projects: [meta("a"), meta("b")], activeProjectId: "a" });
    useProjectStore.getState().patchStats("b", 5, 128);
    const state = useProjectStore.getState();
    expect(state.projects.find((p) => p.id === "a")!.fileCount).toBe(0);
    expect(state.projects.find((p) => p.id === "b")!.fileCount).toBe(5);
    expect(state.projects.find((p) => p.id === "b")!.lineCount).toBe(128);
  });
});
