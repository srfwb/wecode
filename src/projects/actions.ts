import { invoke } from "@tauri-apps/api/core";

import { useIdeStore } from "../state/ideStore";
import { syncVfsNow } from "../tauri/bridge";
import { vfs } from "../vfs/VirtualFS";
import { getAutoSaveHandle } from "./diskAutoSave";
import { joinChild, validateProjectName } from "./paths";
import { useProjectStore } from "./projectStore";
import { createSerializeQueue } from "./serializeQueue";
import { getTemplate, type TemplateId } from "./templates";
import type { ListedFile, ProjectMeta } from "./types";

// Queue open/create/delete so rapid clicks can't interleave. Without this,
// two overlapping `openProject(A)` / `openProject(B)` calls can end up with
// project B's files in project A's folder: step 4 of B writes the hydrated
// VFS via syncVfs while step 5 of A starts a watcher for A — the next
// autosave then takes the current (B) snapshot and writes it to A's path.
const serialize = createSerializeQueue();

export async function loadProjectFilesFromDisk(meta: ProjectMeta): Promise<Record<string, string>> {
  const listed = await invoke<ListedFile[]>("fs_list_project", { projectPath: meta.path });
  const files: Record<string, string> = {};
  for (const entry of listed) {
    if (entry.kind !== "file" || entry.binary) continue;
    const content = await invoke<string>("fs_read_file", {
      projectPath: meta.path,
      relPath: entry.relPath,
    });
    files[entry.relPath] = content;
  }
  return files;
}

export function renameProject(id: string, newName: string): void {
  const error = validateProjectName(newName);
  if (error) throw new Error(error);
  const name = newName.trim();
  const project = useProjectStore.getState().projects.find((p) => p.id === id);
  if (!project) throw new Error(`unknown project: ${id}`);
  if (project.name === name) return;
  useProjectStore.getState().upsert({ ...project, name });
}

export function createProject(input: {
  name: string;
  templateId: TemplateId;
  parentDir?: string;
}): Promise<string> {
  return serialize(() => createProjectImpl(input));
}

async function createProjectImpl(input: {
  name: string;
  templateId: TemplateId;
  parentDir?: string;
}): Promise<string> {
  const nameError = validateProjectName(input.name);
  if (nameError) throw new Error(nameError);
  const name = input.name.trim();

  const parentDir = input.parentDir ?? (await invoke<string>("fs_default_projects_root"));
  await invoke("fs_ensure_dir", { dirPath: parentDir });

  const projectPath = joinChild(parentDir, name);
  const exists = await invoke<boolean>("fs_path_exists", { path: projectPath });
  if (exists) {
    throw new Error(`Un projet avec ce nom existe déjà dans ce dossier.`);
  }
  await invoke("fs_ensure_dir", { dirPath: projectPath });

  const template = getTemplate(input.templateId);
  try {
    for (const [relPath, content] of Object.entries(template.files)) {
      await invoke("fs_write_file", { projectPath, relPath, content });
    }
  } catch (err) {
    // Roll back the partial directory so the user isn't stuck with an
    // orphan folder that blocks every future create at the same path.
    try {
      await invoke("fs_delete_dir", { dirPath: projectPath });
    } catch (cleanupErr) {
      console.warn("rollback after createProject failure", cleanupErr);
    }
    throw err;
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  const fileCount = Object.keys(template.files).length;
  const lineCount = Object.values(template.files).reduce(
    (acc, c) => acc + (c.match(/\n/g)?.length ?? 0),
    0,
  );
  const meta: ProjectMeta = {
    id,
    name,
    path: projectPath,
    kind: template.kind,
    tags: template.tags,
    createdAt: now,
    lastOpenedAt: now,
    fileCount,
    lineCount,
  };
  useProjectStore.getState().upsert(meta);
  // Already inside the serialize queue — bypass the wrapper to avoid
  // self-deadlocking when the impl calls the public entry point.
  await openProjectImpl(id);
  return id;
}

export function deleteProject(id: string, opts: { removeFromDisk: boolean }): Promise<void> {
  return serialize(() => deleteProjectImpl(id, opts));
}

async function deleteProjectImpl(id: string, opts: { removeFromDisk: boolean }): Promise<void> {
  const state = useProjectStore.getState();
  const project = state.projects.find((p) => p.id === id);
  if (!project) throw new Error(`unknown project: ${id}`);
  const isActive = state.activeProjectId === id;

  // Try the disk-delete first (if requested) so a failure leaves the app's
  // state untouched rather than half-torn-down. `fs_delete_dir` is now
  // idempotent on already-absent paths (A1), so re-running after a transient
  // failure is safe.
  if (opts.removeFromDisk) {
    await invoke("fs_delete_dir", { dirPath: project.path });
  }

  if (isActive) {
    const autosave = getAutoSaveHandle();
    if (autosave) await autosave.flush();
    try {
      await invoke("watcher_stop");
    } catch (err) {
      console.warn("watcher_stop failed (ignored)", err);
    }
    vfs.hydrate({});
    if (autosave) autosave.markBaseline({});
    try {
      await syncVfsNow({});
    } catch (err) {
      console.warn("syncVfs after delete failed (ignored)", err);
    }
  }

  const remaining = state.projects.filter((p) => p.id !== id);
  const nextActive =
    isActive && remaining.length > 0
      ? ([...remaining].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)[0]?.id ?? null)
      : isActive
        ? null
        : state.activeProjectId;
  useProjectStore.setState({ projects: remaining, activeProjectId: nextActive });

  if (isActive) {
    if (nextActive) {
      await openProjectImpl(nextActive);
    } else {
      useIdeStore.getState().setView("home");
    }
  }
}

export function openProject(id: string): Promise<void> {
  return serialize(() => openProjectImpl(id));
}

async function openProjectImpl(id: string): Promise<void> {
  const autosave = getAutoSaveHandle();
  if (autosave) await autosave.flush();

  try {
    await invoke("watcher_stop");
  } catch (err) {
    console.warn("watcher_stop failed (ignored)", err);
  }

  const meta = useProjectStore.getState().projects.find((p) => p.id === id);
  if (!meta) throw new Error(`unknown project: ${id}`);

  const files = await loadProjectFilesFromDisk(meta);
  vfs.hydrate(files);
  if (autosave) autosave.markBaseline(files);
  await syncVfsNow(vfs.snapshot());

  try {
    await invoke("watcher_start", { projectPath: meta.path, projectId: id });
  } catch (err) {
    console.warn("watcher_start failed (external changes will not be picked up)", err);
  }

  useProjectStore.getState().setActive(id, { touch: true });
  useIdeStore.getState().setView("ide");
}
