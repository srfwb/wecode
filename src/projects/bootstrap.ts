import { invoke } from "@tauri-apps/api/core";

import { persistedStore } from "../tauri/persistedStore";
import { DEFAULT_FILES } from "../vfs/defaults";
import { openProject } from "./actions";
import { joinChild } from "./paths";
import { loadProjectsIndex, saveProjectsIndex } from "./persistence";
import { useProjectStore } from "./projectStore";
import type { ProjectMeta } from "./types";

const legacyStore = persistedStore("wecode.store.json");

async function tryLoadLegacyVfsBlob(): Promise<Record<string, string> | null> {
  try {
    const store = await legacyStore();
    return (await store.get<Record<string, string>>("vfs.v1")) ?? null;
  } catch {
    return null;
  }
}

function countLines(files: Record<string, string>): number {
  return Object.values(files).reduce((acc, c) => acc + (c.match(/\n/g)?.length ?? 0), 0);
}

export async function bootstrapProjects(): Promise<void> {
  const rootPath = await invoke<string>("fs_default_projects_root");
  await invoke("fs_ensure_dir", { dirPath: rootPath });

  const existing = await loadProjectsIndex();

  // If the projects index has been written at least once, trust it —
  // even if it is currently empty (the user deleted their only project).
  // Re-seeding would silently overwrite/ignore user history; leaving the
  // list blank is the correct behavior and lets them create a new project
  // from the Home view.
  if (existing !== null) {
    useProjectStore.getState().hydrate(existing);
    const activeId = existing.activeProjectId ?? existing.projects[0]?.id ?? null;
    if (activeId && existing.projects.some((p) => p.id === activeId)) {
      await openProject(activeId);
    }
    return;
  }

  // No index on disk — first launch (or upgrade from v0.1.0, which only
  // wrote `wecode.store.json`). Seed from the legacy VFS blob if present,
  // otherwise fall back to the built-in template.
  const firstStepsPath = joinChild(rootPath, "First steps");
  await invoke("fs_ensure_dir", { dirPath: firstStepsPath });

  const legacy = await tryLoadLegacyVfsBlob();
  const seed = legacy && Object.keys(legacy).length > 0 ? legacy : DEFAULT_FILES;
  for (const [relPath, content] of Object.entries(seed)) {
    await invoke("fs_write_file", { projectPath: firstStepsPath, relPath, content });
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  const meta: ProjectMeta = {
    id,
    name: "First steps",
    path: firstStepsPath,
    kind: "html",
    tags: ["html", "css"],
    createdAt: now,
    lastOpenedAt: now,
    fileCount: Object.keys(seed).length,
    lineCount: countLines(seed),
  };
  const index = { version: 1 as const, projects: [meta], activeProjectId: id };
  useProjectStore.getState().hydrate(index);
  await saveProjectsIndex(index);
  await openProject(id);
}
