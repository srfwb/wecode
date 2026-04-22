import { invoke } from "@tauri-apps/api/core";

import { useIdeStore } from "../state/ideStore";
import { syncVfs } from "../tauri/bridge";
import { vfs } from "../vfs/VirtualFS";
import { getAutoSaveHandle } from "./diskAutoSave";
import { joinChild, validateProjectName } from "./paths";
import { useProjectStore } from "./projectStore";
import { getTemplate, type TemplateId } from "./templates";
import type { ListedFile, ProjectMeta } from "./types";

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

export async function createProject(input: {
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
    throw new Error(`Un dossier existe déjà à ${projectPath}.`);
  }
  await invoke("fs_ensure_dir", { dirPath: projectPath });

  const template = getTemplate(input.templateId);
  for (const [relPath, content] of Object.entries(template.files)) {
    await invoke("fs_write_file", { projectPath, relPath, content });
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
  await openProject(id);
  return id;
}

export async function openProject(id: string): Promise<void> {
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
  await syncVfs(vfs.snapshot());

  try {
    await invoke("watcher_start", { projectPath: meta.path });
  } catch (err) {
    console.warn("watcher_start failed (external changes will not be picked up)", err);
  }

  useProjectStore.getState().setActive(id, { touch: true });
  useIdeStore.getState().setView("ide");
}
